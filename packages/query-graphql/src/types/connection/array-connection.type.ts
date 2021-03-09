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

      static async createFromPromise(queryMany: QueryMany<DTO>, query: Query<DTO>): Promise<AbstractConnection> {
        const { paging, ...rest } = query;
        return queryMany(rest);
      }
    }
    return AbstractConnection;
  });
}
