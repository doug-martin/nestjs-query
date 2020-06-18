import { Query } from '@nestjs-query/core';
import { ReturnTypeFuncValue } from '@nestjs/graphql';
import { QueryArgsType } from '../query';
import { ArrayConnectionType } from './array-connection.type';
import { CursorConnectionType } from './cursor';

export interface StaticConnection<DTO, QueryType extends QueryArgsType<DTO>, ConnectionType extends Connection<DTO>> {
  resolveType: ReturnTypeFuncValue;
  createFromPromise(queryMany: (query: Query<DTO>) => Promise<DTO[]>, query: QueryType): Promise<ConnectionType>;
  new (): ConnectionType;
}

export type Connection<DTO> = CursorConnectionType<DTO> | ArrayConnectionType<DTO>;
