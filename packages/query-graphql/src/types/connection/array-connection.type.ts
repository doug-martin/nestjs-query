import { Class } from '@nestjs-query/core';
import { OffsetQueryArgsType, NoPagingQueryArgsType } from '../query/query-args';
import { QueryMany, StaticConnection } from './interfaces';
import { getMetadataStorage } from '../../metadata';

export type StaticArrayConnectionType<DTO> = StaticConnection<
  DTO,
  OffsetQueryArgsType<DTO> | NoPagingQueryArgsType<DTO>,
  ArrayConnectionType<DTO>
>;

export type ArrayConnectionType<DTO> = DTO[];
export function ArrayConnectionType<DTO>(TItemClass: Class<DTO>): StaticArrayConnectionType<DTO> {
  const metadataStorage = getMetadataStorage();
  const existing = metadataStorage.getConnectionType<DTO, StaticArrayConnectionType<DTO>>('array', TItemClass.name);
  if (existing) {
    return existing;
  }
  class AbstractConnection extends Array<DTO> {
    static resolveType = [TItemClass];

    static async createFromPromise(
      queryMany: QueryMany<DTO>,
      query: OffsetQueryArgsType<DTO> | NoPagingQueryArgsType<DTO>,
    ): Promise<AbstractConnection> {
      return queryMany(query);
    }
  }
  metadataStorage.addConnectionType('array', TItemClass.name, AbstractConnection);
  return AbstractConnection;
}
