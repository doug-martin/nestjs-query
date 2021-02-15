import { Query } from '@nestjs-query/core';
import { Count, Pager, QueryMany } from '../../interfaces';
import { OffsetQueryArgsType } from '../../../query';
import { OffsetPagerResult, OffsetPagingMeta, OffsetPagingOpts, QueryResults } from './interfaces';

const EMPTY_PAGING_RESULTS = <DTO>(): OffsetPagerResult<DTO> => ({
  nodes: [],
  pageInfo: { hasNextPage: false, hasPreviousPage: false },
  totalCount: () => Promise.resolve(0),
});

const DEFAULT_PAGING_META = <DTO>(query: Query<DTO>): OffsetPagingMeta<DTO> => ({
  opts: { offset: 0, limit: 0 },
  query,
});

export class OffsetPager<DTO> implements Pager<DTO, OffsetPagerResult<DTO>> {
  async page(queryMany: QueryMany<DTO>, query: Query<DTO>, count: Count<DTO>): Promise<OffsetPagerResult<DTO>> {
    const pagingMeta = this.getPageMeta(query);
    if (!this.isValidPaging(pagingMeta)) {
      return EMPTY_PAGING_RESULTS();
    }
    const results = await this.runQuery(queryMany, query, pagingMeta);
    return this.createPagingResult(results, pagingMeta, () => count(query.filter ?? {}));
  }

  private isValidPaging(pagingMeta: OffsetPagingMeta<DTO>): boolean {
    return pagingMeta.opts.limit > 0;
  }

  private async runQuery(
    queryMany: QueryMany<DTO>,
    query: Query<DTO>,
    pagingMeta: OffsetPagingMeta<DTO>,
  ): Promise<QueryResults<DTO>> {
    const windowedQuery = this.createQuery(query, pagingMeta);
    const nodes = await queryMany(windowedQuery);
    const returnNodes = this.checkForExtraNode(nodes, pagingMeta.opts);
    const hasExtraNode = returnNodes.length !== nodes.length;
    return { nodes: returnNodes, hasExtraNode };
  }

  private getPageMeta(query: OffsetQueryArgsType<DTO>): OffsetPagingMeta<DTO> {
    const { limit = 0, offset = 0 } = query.paging ?? {};
    if (!limit) {
      return DEFAULT_PAGING_META(query);
    }
    return { opts: { limit, offset }, query };
  }

  private createPagingResult(
    results: QueryResults<DTO>,
    pagingMeta: OffsetPagingMeta<DTO>,
    totalCount: () => Promise<number>,
  ): OffsetPagerResult<DTO> {
    const { nodes, hasExtraNode } = results;
    const pageInfo = {
      hasNextPage: hasExtraNode,
      // we have a previous page if we are going backwards and have an extra node.
      hasPreviousPage: pagingMeta.opts.offset > 0,
    };

    return { nodes, pageInfo, totalCount };
  }

  private createQuery(query: OffsetQueryArgsType<DTO>, pagingMeta: OffsetPagingMeta<DTO>): Query<DTO> {
    const { limit, offset } = pagingMeta.opts;
    return { ...query, paging: { limit: limit + 1, offset } };
  }

  private checkForExtraNode(nodes: DTO[], opts: OffsetPagingOpts): DTO[] {
    const returnNodes = [...nodes];
    const hasExtraNode = nodes.length > opts.limit;
    if (hasExtraNode) {
      returnNodes.pop();
    }
    return returnNodes;
  }
}
