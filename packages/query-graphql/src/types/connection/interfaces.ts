import { Class, Filter, Query } from '@nestjs-query/core';
import { ReturnTypeFuncValue } from '@nestjs/graphql';
import { ConnectionCursorType } from '../cursor.scalar';
import { PagingStrategies } from '../query';

interface BaseConnectionOptions {
  enableTotalCount?: boolean;
  connectionName?: string;
  disableKeySetPagination?: boolean;
}

export interface CursorConnectionOptions extends BaseConnectionOptions {
  pagingStrategy?: PagingStrategies.CURSOR;
}

export interface OffsetConnectionOptions extends BaseConnectionOptions {
  pagingStrategy: PagingStrategies.OFFSET;
}

export interface ArrayConnectionOptions extends BaseConnectionOptions {
  pagingStrategy: PagingStrategies.NONE;
}
export type ConnectionOptions = CursorConnectionOptions | OffsetConnectionOptions | ArrayConnectionOptions;

export interface EdgeType<DTO> {
  node: DTO;
  cursor: ConnectionCursorType;
}

export interface PageInfoType {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: ConnectionCursorType | undefined;
  endCursor?: ConnectionCursorType | undefined;
}

export type CursorConnectionType<DTO> = {
  pageInfo: PageInfoType;
  edges: EdgeType<DTO>[];
  totalCount?: Promise<number>;
};

export interface OffsetPageInfoType {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export type OffsetConnectionType<DTO> = {
  pageInfo: OffsetPageInfoType;
  totalCount?: Promise<number>;
  nodes: DTO[];
};

export type ArrayConnectionType<DTO> = DTO[];

export type ConnectionType<DTO> = OffsetConnectionType<DTO> | CursorConnectionType<DTO> | ArrayConnectionType<DTO>;

export type InferConnectionTypeFromStrategy<DTO, S extends PagingStrategies> = S extends PagingStrategies.NONE
  ? ArrayConnectionType<DTO>
  : S extends PagingStrategies.OFFSET
  ? OffsetConnectionType<DTO>
  : S extends PagingStrategies.CURSOR
  ? CursorConnectionType<DTO>
  : never;

export type QueryMany<DTO, Q extends Query<DTO>> = (query: Q) => Promise<DTO[]>;
export type Count<DTO> = (filter: Filter<DTO>) => Promise<number>;

export type CountFn = () => Promise<number>;

export type PagerResult = {
  totalCount: CountFn;
};

export interface Pager<DTO, R extends PagerResult> {
  page<Q extends Query<DTO>>(queryMany: QueryMany<DTO, Q>, query: Q, count: Count<DTO>): Promise<R>;
}

export interface StaticConnectionType<DTO, S extends PagingStrategies>
  extends Class<InferConnectionTypeFromStrategy<DTO, S>> {
  resolveType: ReturnTypeFuncValue;
  createFromPromise<Q extends Query<DTO>>(
    queryMany: QueryMany<DTO, Q>,
    query: Q,
    count?: Count<DTO>,
  ): Promise<InferConnectionTypeFromStrategy<DTO, S>>;
}
