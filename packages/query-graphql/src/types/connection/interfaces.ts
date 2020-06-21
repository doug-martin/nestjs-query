import { Filter, Query } from '@nestjs-query/core';
import { ReturnTypeFuncValue } from '@nestjs/graphql';
import { QueryArgsType } from '../query';
import { ArrayConnectionType } from './array-connection.type';
import { CursorConnectionType } from './cursor';

export type QueryMany<DTO> = (query: Query<DTO>) => Promise<DTO[]>;
export type Count<DTO> = (filter: Filter<DTO>) => Promise<number>;

export interface StaticConnection<DTO, QueryType extends QueryArgsType<DTO>, ConnectionType extends Connection<DTO>> {
  resolveType: ReturnTypeFuncValue;
  createFromPromise(queryMany: QueryMany<DTO>, query: QueryType, count?: Count<DTO>): Promise<ConnectionType>;
  new (): ConnectionType;
}

export type Connection<DTO> = CursorConnectionType<DTO> | ArrayConnectionType<DTO>;
