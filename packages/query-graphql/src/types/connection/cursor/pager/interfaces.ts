import { Query } from '@nestjs-query/core';
import { PagingOpts } from './strategies';
import { CursorQueryArgsType } from '../../../query';
import { Count, QueryMany } from '../../interfaces';
import { CursorConnectionType } from '../cursor-connection.type';

export interface PagingMeta<DTO, Opts extends PagingOpts<DTO>> {
  opts: Opts;
  query: Query<DTO>;
}

export interface QueryResults<DTO> {
  nodes: DTO[];
  hasExtraNode: boolean;
}

export type CountFn = () => Promise<number>;

export type PagerResult<DTO> = {
  totalCount: CountFn;
} & Omit<CursorConnectionType<DTO>, 'totalCount'>;

export interface Pager<DTO> {
  page(queryMany: QueryMany<DTO>, query: CursorQueryArgsType<DTO>, count: Count<DTO>): Promise<PagerResult<DTO>>;
}
