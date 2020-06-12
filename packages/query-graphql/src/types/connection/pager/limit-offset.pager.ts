import { Query } from '@nestjs-query/core';
import { offsetToCursor } from 'graphql-relay';
import { CursorQueryArgsType } from '../../query';
import { EdgeType } from '../edge.type';
import { PagingMeta, PagingResults, QueryMany, QueryResults } from './interfaces';

const EMPTY_PAGING_RESULTS = <DTO>(): PagingResults<DTO> => ({
  edges: [],
  pageInfo: { hasNextPage: false, hasPreviousPage: false },
});

const DEFAULT_PAGING_META = (): PagingMeta => ({
  offset: 0,
  limit: 0,
  isBackward: false,
  isForward: true,
  hasBefore: false,
});

export class CursorPager<DTO> {
  async page(queryMany: QueryMany<DTO>, query: CursorQueryArgsType<DTO>): Promise<PagingResults<DTO>> {
    const pagingMeta = this.getPageMeta(query);
    if (!CursorPager.pagingMetaHasLimitOrOffset(pagingMeta)) {
      return EMPTY_PAGING_RESULTS();
    }
    const results = await this.runQuery(queryMany, query, pagingMeta);
    if (this.isEmptyPage(results, pagingMeta)) {
      return EMPTY_PAGING_RESULTS();
    }
    return this.createPagingResult(results, pagingMeta);
  }

  private static pagingMetaHasLimitOrOffset(pagingMeta: PagingMeta): boolean {
    return pagingMeta.offset > 0 || pagingMeta.limit > 0;
  }

  async runQuery(queryMany: QueryMany<DTO>, query: Query<DTO>, pagingMeta: PagingMeta): Promise<QueryResults<DTO>> {
    // Add 1 to the limit so we will fetch an additional node
    let limit = pagingMeta.limit + 1;
    // if paging backwards remove one from the offset to check for a previous page.
    let offset = pagingMeta.isBackward ? pagingMeta.offset - 1 : pagingMeta.offset;
    if (offset < 0) {
      // if the offset is < 0 it means we underflowed and that we cant have an extra page.
      offset = 0;
      limit = pagingMeta.limit;
    }
    const nodes = await queryMany({ ...query, paging: { limit, offset } });
    // check if we have an additional node
    // if paging forward that indicates we have a next page
    // if paging backward that indicates we have a previous page.
    const hasExtraNode = nodes.length > pagingMeta.limit;
    if (hasExtraNode) {
      // remove the additional node so its not returned in the results.
      if (pagingMeta.isForward) {
        nodes.pop();
      } else {
        nodes.shift();
      }
    }
    return { nodes, hasExtraNode };
  }

  getPageMeta(query: CursorQueryArgsType<DTO>): PagingMeta {
    const { paging } = query;
    if (!paging) {
      return DEFAULT_PAGING_META();
    }
    const offset = paging.offset ?? 0;
    const limit = paging.limit ?? 0;
    const isBackward = typeof paging.last !== 'undefined';
    const isForward = !isBackward;
    const hasBefore = isBackward && !!paging.before;
    return { offset, limit, isBackward, isForward, hasBefore };
  }

  createPagingResult(results: QueryResults<DTO>, pagingMeta: PagingMeta): PagingResults<DTO> {
    const { nodes, hasExtraNode } = results;
    const { offset, hasBefore, isBackward, isForward } = pagingMeta;
    const endOffset = Math.max(0, offset + nodes.length - 1);
    const pageInfo = {
      startCursor: offsetToCursor(offset),
      endCursor: offsetToCursor(endOffset),
      // if we have are going forward and have an extra node or there was a before cursor
      hasNextPage: isForward ? hasExtraNode : hasBefore,
      // we have a previous page if we are going backwards and have an extra node.
      hasPreviousPage: isBackward ? hasExtraNode : offset > 0,
    };

    const edges: EdgeType<DTO>[] = nodes.map((node, i) => ({ node, cursor: offsetToCursor(offset + i) }));
    return { edges, pageInfo };
  }

  isEmptyPage(results: QueryResults<DTO>, pagingMeta: PagingMeta): boolean {
    // it is an empty page if
    // 1. we dont have an extra node
    // 2. there were no nodes returned
    // 3. we're paging forward
    // 4. and we dont have an offset
    return !results.hasExtraNode && !results.nodes.length && pagingMeta.isForward && !pagingMeta.offset;
  }
}
