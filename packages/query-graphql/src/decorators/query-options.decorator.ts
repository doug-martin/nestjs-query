import { Class, MetaValue, ValueReflector } from '@nestjs-query/core';
import { QueryArgsTypeOpts } from '../types';
import { QUERY_OPTIONS_KEY } from './constants';

const valueReflector = new ValueReflector(QUERY_OPTIONS_KEY);

export type QueryOptionsDecoratorOpts<DTO> = QueryArgsTypeOpts<DTO>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function QueryOptions(opts: QueryOptionsDecoratorOpts<any>) {
  return (target: Class<unknown>): void => {
    valueReflector.set(target, opts);
  };
}
export const getQueryOptions = <DTO>(DTOClass: Class<DTO>): MetaValue<QueryArgsTypeOpts<DTO>> =>
  valueReflector.get(DTOClass);
