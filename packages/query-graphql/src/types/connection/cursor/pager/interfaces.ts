import { CursorQueryArgsType } from '../../../query';
import { Count, QueryMany } from '../../interfaces';
import { CursorConnectionType } from '../cursor-connection.type';

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

export type CountFn = () => Promise<number>;

export type PagerResult<DTO> = {
  totalCount: CountFn;
} & Omit<CursorConnectionType<DTO>, 'totalCount'>;

export interface Pager<DTO> {
  page(queryMany: QueryMany<DTO>, query: CursorQueryArgsType<DTO>, count: Count<DTO>): Promise<PagerResult<DTO>>;
}
