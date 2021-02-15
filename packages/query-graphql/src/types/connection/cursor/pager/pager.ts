import { Query } from '@nestjs-query/core';
import { CursorPagingOpts, OffsetPagingOpts, PagerStrategy } from './strategies';
import { Count, Pager, QueryMany } from '../../interfaces';
import { EdgeType } from '../edge.type';
import { CursorQueryArgsType } from '../../../query';
import { CursorPagerResult, PagingMeta, QueryResults } from './interfaces';

const EMPTY_PAGING_RESULTS = <DTO>(): CursorPagerResult<DTO> => ({
  edges: [],
  pageInfo: { hasNextPage: false, hasPreviousPage: false },
  totalCount: () => Promise.resolve(0),
});

const DEFAULT_PAGING_META = <DTO>(query: Query<DTO>): PagingMeta<DTO, OffsetPagingOpts> => ({
  opts: { offset: 0, limit: 0, isBackward: false, isForward: true, hasBefore: false },
  query,
});

export class CursorPager<DTO> implements Pager<DTO, CursorPagerResult<DTO>> {
  constructor(readonly strategy: PagerStrategy<DTO>) {}

  async page(
    queryMany: QueryMany<DTO>,
    query: CursorQueryArgsType<DTO>,
    count: Count<DTO>,
  ): Promise<CursorPagerResult<DTO>> {
    const pagingMeta = this.getPageMeta(query);
    if (!this.isValidPaging(pagingMeta)) {
      return EMPTY_PAGING_RESULTS();
    }
    const results = await this.runQuery(queryMany, query, pagingMeta);
    if (this.isEmptyPage(results, pagingMeta)) {
      return EMPTY_PAGING_RESULTS();
    }
    return this.createPagingResult(results, pagingMeta, () => count(query.filter ?? {}));
  }

  private isValidPaging(pagingMeta: PagingMeta<DTO, CursorPagingOpts<DTO>>): boolean {
    if ('offset' in pagingMeta.opts) {
      return pagingMeta.opts.offset > 0 || pagingMeta.opts.limit > 0;
    }
    return pagingMeta.opts.limit > 0;
  }

  private async runQuery(
    queryMany: QueryMany<DTO>,
    query: Query<DTO>,
    pagingMeta: PagingMeta<DTO, CursorPagingOpts<DTO>>,
  ): Promise<QueryResults<DTO>> {
    const { opts } = pagingMeta;
    const windowedQuery = this.strategy.createQuery(query, opts, true);
    const nodes = await queryMany(windowedQuery);
    const returnNodes = this.strategy.checkForExtraNode(nodes, opts);
    const hasExtraNode = returnNodes.length !== nodes.length;
    return { nodes: returnNodes, hasExtraNode };
  }

  private getPageMeta(query: CursorQueryArgsType<DTO>): PagingMeta<DTO, CursorPagingOpts<DTO>> {
    const { paging } = query;
    if (!paging) {
      return DEFAULT_PAGING_META(query);
    }
    return { opts: this.strategy.fromCursorArgs(paging), query };
  }

  private createPagingResult(
    results: QueryResults<DTO>,
    pagingMeta: PagingMeta<DTO, CursorPagingOpts<DTO>>,
    totalCount: () => Promise<number>,
  ): CursorPagerResult<DTO> {
    const { nodes, hasExtraNode } = results;
    const { isForward, hasBefore } = pagingMeta.opts;
    const edges: EdgeType<DTO>[] = nodes.map((node, i) => ({
      node,
      cursor: this.strategy.toCursor(node, i, pagingMeta.opts, pagingMeta.query),
    }));
    const pageInfo = {
      startCursor: edges[0]?.cursor,
      endCursor: edges[edges.length - 1]?.cursor,
      // if we have are going forward and have an extra node or there was a before cursor
      hasNextPage: isForward ? hasExtraNode : hasBefore,
      // we have a previous page if we are going backwards and have an extra node.
      hasPreviousPage: this.hasPreviousPage(results, pagingMeta),
    };

    return { edges, pageInfo, totalCount };
  }

  private hasPreviousPage(results: QueryResults<DTO>, pagingMeta: PagingMeta<DTO, CursorPagingOpts<DTO>>): boolean {
    const { hasExtraNode } = results;
    const { opts } = pagingMeta;
    return opts.isBackward ? hasExtraNode : !this.strategy.isEmptyCursor(opts);
  }

  private isEmptyPage(results: QueryResults<DTO>, pagingMeta: PagingMeta<DTO, CursorPagingOpts<DTO>>): boolean {
    // it is an empty page if
    // 1. we dont have an extra node
    // 2. there were no nodes returned
    // 3. we're paging forward
    // 4. and we dont have an offset
    const { opts } = pagingMeta;
    const isEmpty = !results.hasExtraNode && !results.nodes.length && pagingMeta.opts.isForward;
    return isEmpty && this.strategy.isEmptyCursor(opts);
  }
}
