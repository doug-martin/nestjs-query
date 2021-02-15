import { Paging, Query } from '@nestjs-query/core';
import { PagerResult } from '../../interfaces';
import { OffsetConnectionType } from '../offset-connection.type';

export type OffsetPagingOpts = Required<Paging>;

export interface OffsetPagingMeta<DTO> {
  opts: OffsetPagingOpts;
  query: Query<DTO>;
}

export interface QueryResults<DTO> {
  nodes: DTO[];
  hasExtraNode: boolean;
}
export type OffsetPagerResult<DTO> = PagerResult & Omit<OffsetConnectionType<DTO>, 'totalCount'>;
