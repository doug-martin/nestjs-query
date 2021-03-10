import { Query } from '@nestjs-query/core';
import { CursorPagingOpts } from './strategies';
import { CursorConnectionType } from '../cursor-connection.type';
import { PagerResult } from '../../interfaces';

export interface PagingMeta<DTO, Opts extends CursorPagingOpts<DTO>> {
  opts: Opts;
  query: Query<DTO>;
}

export interface QueryResults<DTO> {
  nodes: DTO[];
  hasExtraNode: boolean;
}

export type CursorPagerResult<DTO> = PagerResult & Omit<CursorConnectionType<DTO>, 'totalCount'>;
