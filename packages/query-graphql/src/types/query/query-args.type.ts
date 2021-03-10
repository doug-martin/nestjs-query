import { Class } from '@nestjs-query/core';
import { PagingStrategies } from './paging';
import {
  CursorQueryArgsType,
  DEFAULT_QUERY_OPTS,
  NoPagingQueryArgsType,
  OffsetQueryArgsType,
  StaticCursorQueryArgsType,
  StaticNoPagingQueryArgsType,
  StaticOffsetQueryArgsType,
  OffsetQueryArgsTypeOpts,
  NoPagingQueryArgsTypeOpts,
  QueryArgsTypeOpts,
} from './query-args';

export type StaticQueryArgsType<DTO> =
  | StaticNoPagingQueryArgsType<DTO>
  | StaticCursorQueryArgsType<DTO>
  | StaticOffsetQueryArgsType<DTO>;

// tests if the object is a QueryArgs Class
// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
export const isStaticQueryArgsType = <DTO>(obj: any): obj is StaticQueryArgsType<DTO> =>
  typeof obj === 'function' && ('PageType' in obj || 'SortType' in obj || 'FilterType' in obj);

export type QueryArgsType<DTO> = NoPagingQueryArgsType<DTO> | CursorQueryArgsType<DTO> | OffsetQueryArgsType<DTO>;

export function QueryArgsType<DTO>(
  DTOClass: Class<DTO>,
  opts: OffsetQueryArgsTypeOpts<DTO>,
): StaticOffsetQueryArgsType<DTO>;
export function QueryArgsType<DTO>(
  DTOClass: Class<DTO>,
  opts: NoPagingQueryArgsTypeOpts<DTO>,
): StaticNoPagingQueryArgsType<DTO>;
export function QueryArgsType<DTO>(DTOClass: Class<DTO>, opts?: QueryArgsTypeOpts<DTO>): StaticCursorQueryArgsType<DTO>;
// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentional
export function QueryArgsType<DTO>(
  DTOClass: Class<DTO>,
  opts: QueryArgsTypeOpts<DTO> = { ...DEFAULT_QUERY_OPTS, pagingStrategy: PagingStrategies.CURSOR },
): StaticQueryArgsType<DTO> {
  if (opts.pagingStrategy === PagingStrategies.OFFSET) {
    return OffsetQueryArgsType(DTOClass, opts);
  }
  if (opts.pagingStrategy === PagingStrategies.NONE) {
    return NoPagingQueryArgsType(DTOClass, opts);
  }
  return CursorQueryArgsType(DTOClass, opts);
}
