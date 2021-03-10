import { Class, Query, ValueReflector } from '@nestjs-query/core';
import { PagingStrategies } from '../query';
import { BaseConnectionOptions, QueryMany, StaticConnection } from './interfaces';

export interface ArrayConnectionOptions extends BaseConnectionOptions {
  pagingStrategy: PagingStrategies.NONE;
}

export type StaticArrayConnectionType<DTO> = StaticConnection<DTO, ArrayConnectionType<DTO>>;

const reflector = new ValueReflector('nestjs-query:array-connection-type');

export type ArrayConnectionType<DTO> = DTO[];
// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentional
export function ArrayConnectionType<DTO>(TItemClass: Class<DTO>): StaticArrayConnectionType<DTO> {
  return reflector.memoize(TItemClass, () => {
    class AbstractConnection extends Array<DTO> {
      static resolveType = [TItemClass];

      static async createFromPromise(queryMany: QueryMany<DTO>, query: Query<DTO>): Promise<AbstractConnection> {
        const { paging, ...rest } = query;
        return queryMany(rest);
      }
    }
    return AbstractConnection;
  });
}
