import { Class, Query, ValueReflector } from '@nestjs-query/core';
import { PagingStrategies } from '../query';
import { QueryMany, StaticConnectionType } from './interfaces';

const reflector = new ValueReflector('nestjs-query:array-connection-type');

export function getOrCreateArrayConnectionType<DTO>(
  TItemClass: Class<DTO>,
): StaticConnectionType<DTO, PagingStrategies.NONE> {
  return reflector.memoize(TItemClass, () => {
    class AbstractConnection extends Array<DTO> {
      static resolveType = [TItemClass];

      static async createFromPromise<Q extends Query<DTO>>(
        queryMany: QueryMany<DTO, Q>,
        query: Q,
      ): Promise<AbstractConnection> {
        // remove paging from the query because the ArrayConnection does not support paging.
        const { paging, ...rest } = query;
        return queryMany(rest as Q);
      }
    }
    return AbstractConnection;
  });
}
