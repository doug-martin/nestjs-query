import { Class, Filter, Query } from '@nestjs-query/core';
import { ReturnTypeFuncValue } from '@nestjs/graphql';
import { ArrayConnectionType } from './array-connection.type';
import { CursorConnectionType } from './cursor';
import { OffsetConnectionType } from './offset';

export interface BaseConnectionOptions {
  enableTotalCount?: boolean;
  connectionName?: string;
  disableKeySetPagination?: boolean;
}

export type QueryMany<DTO> = (query: Query<DTO>) => Promise<DTO[]>;
export type Count<DTO> = (filter: Filter<DTO>) => Promise<number>;

export type CountFn = () => Promise<number>;

export type PagerResult = {
  totalCount: CountFn;
};

export interface Pager<DTO, R extends PagerResult> {
  page(queryMany: QueryMany<DTO>, query: Query<DTO>, count: Count<DTO>): Promise<R>;
}

export interface StaticConnection<DTO, ConnectionType extends Connection<DTO>> extends Class<ConnectionType> {
  resolveType: ReturnTypeFuncValue;
  createFromPromise(queryMany: QueryMany<DTO>, query: Query<DTO>, count?: Count<DTO>): Promise<ConnectionType>;
}

export type Connection<DTO> = CursorConnectionType<DTO> | OffsetConnectionType<DTO> | ArrayConnectionType<DTO>;
