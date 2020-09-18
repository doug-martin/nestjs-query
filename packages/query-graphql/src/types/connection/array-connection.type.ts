import { Class, ValueReflector } from '@nestjs-query/core';
import { OffsetQueryArgsType, NoPagingQueryArgsType } from '../query/query-args';
import { QueryMany, StaticConnection } from './interfaces';

export type StaticArrayConnectionType<DTO> = StaticConnection<
  DTO,
  OffsetQueryArgsType<DTO> | NoPagingQueryArgsType<DTO>,
  ArrayConnectionType<DTO>
>;

const reflector = new ValueReflector('nestjs-query:array-connection-type');

export type ArrayConnectionType<DTO> = DTO[];
// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentional
export function ArrayConnectionType<DTO>(TItemClass: Class<DTO>): StaticArrayConnectionType<DTO> {
  return reflector.memoize(TItemClass, () => {
    class AbstractConnection extends Array<DTO> {
      static resolveType = [TItemClass];

      static async createFromPromise(
        queryMany: QueryMany<DTO>,
        query: OffsetQueryArgsType<DTO> | NoPagingQueryArgsType<DTO>,
      ): Promise<AbstractConnection> {
        return queryMany(query);
      }
    }
    return AbstractConnection;
  });
}
