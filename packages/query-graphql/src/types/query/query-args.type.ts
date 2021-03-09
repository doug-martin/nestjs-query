import { Class } from '@nestjs-query/core';
import { PagingStrategies } from './paging';
import {
  DEFAULT_QUERY_OPTS,
  CursorQueryArgsTypeOpts,
  OffsetQueryArgsTypeOpts,
  NonePagingQueryArgsTypeOpts,
  QueryArgsTypeOpts,
  StaticQueryType,
  createOffsetQueryArgs,
  createNonePagingQueryArgsType,
  createCursorQueryArgsType,
} from './query-args';
import { getQueryOptions } from '../../decorators';
import { removeUndefinedValues } from '../../common';

const getMergedQueryOpts = <DTO>(DTOClass: Class<DTO>, opts?: QueryArgsTypeOpts<DTO>): QueryArgsTypeOpts<DTO> => {
  const decoratorOpts = getQueryOptions(DTOClass);
  return {
    ...DEFAULT_QUERY_OPTS,
    pagingStrategy: PagingStrategies.CURSOR,
    ...removeUndefinedValues(decoratorOpts ?? {}),
    ...removeUndefinedValues(opts ?? {}),
  };
};

// tests if the object is a QueryArgs Class
// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
export const isStaticQueryArgsType = <DTO>(obj: any): obj is StaticQueryType<DTO, PagingStrategies> =>
  typeof obj === 'function' && 'PageType' in obj && 'SortType' in obj && 'FilterType' in obj;

export function QueryArgsType<DTO>(
  DTOClass: Class<DTO>,
  opts: OffsetQueryArgsTypeOpts<DTO>,
): StaticQueryType<DTO, PagingStrategies.OFFSET>;
export function QueryArgsType<DTO>(
  DTOClass: Class<DTO>,
  opts: NonePagingQueryArgsTypeOpts<DTO>,
): StaticQueryType<DTO, PagingStrategies.NONE>;
export function QueryArgsType<DTO>(
  DTOClass: Class<DTO>,
  opts: CursorQueryArgsTypeOpts<DTO>,
): StaticQueryType<DTO, PagingStrategies.CURSOR>;
export function QueryArgsType<DTO>(
  DTOClass: Class<DTO>,
  opts?: QueryArgsTypeOpts<DTO>,
): StaticQueryType<DTO, PagingStrategies>;
export function QueryArgsType<DTO>(
  DTOClass: Class<DTO>,
  opts?: QueryArgsTypeOpts<DTO>,
): StaticQueryType<DTO, PagingStrategies> {
  // override any options from the DTO with the options passed in
  const mergedOpts = getMergedQueryOpts(DTOClass, opts);
  if (mergedOpts.pagingStrategy === PagingStrategies.OFFSET) {
    return createOffsetQueryArgs(DTOClass, mergedOpts);
  }
  if (mergedOpts.pagingStrategy === PagingStrategies.NONE) {
    return createNonePagingQueryArgsType(DTOClass, mergedOpts);
  }
  return createCursorQueryArgsType(DTOClass, mergedOpts);
}
