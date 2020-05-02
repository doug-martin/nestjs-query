import { Query } from '@nestjs-query/core';
import { QueryArgsType } from '../../query';
import { EdgeType } from '../edge.type';
import { PageInfoType } from '../page-info.type';

export interface PagingMeta {
  offset: number;
  limit: number;
  isBackward: boolean;
  isForward: boolean;
  hasBefore: boolean;
}

export interface QueryResults<DTO> {
  nodes: DTO[];
  hasExtraNode: boolean;
}

export interface PagingResults<DTO> {
  pageInfo: PageInfoType;
  edges: EdgeType<DTO>[];
}
export type QueryMany<DTO> = (query: Query<DTO>) => Promise<DTO[]>;

export interface Pager<DTO> {
  page(queryMany: QueryMany<DTO>, query: QueryArgsType<DTO>): Promise<PagingResults<DTO>>;
}
