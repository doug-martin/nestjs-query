import { connectionFromPromisedArray } from 'graphql-relay';
import { Field, ObjectType } from 'type-graphql';
import { Class } from '@nestjs-query/core';
import { CursorPagingType } from '../query';
import { PageInfoType } from './page-info.type';
import { EdgeType } from './edge.type';

export interface StaticConnectionType<TItem> {
  create(findMany: Promise<TItem[]>, pagingInfo?: CursorPagingType): Promise<ConnectionType<TItem>>;
  new (): ConnectionType<TItem>;
}

export interface ConnectionType<TItem> {
  pageInfo: PageInfoType;
  edges: EdgeType<TItem>[];
}

export function ConnectionType<TItem>(TItemClass: Class<TItem>): StaticConnectionType<TItem> {
  const E = EdgeType(TItemClass);
  const PIT = PageInfoType();
  @ObjectType({ isAbstract: true })
  class AbstractConnection implements ConnectionType<TItem> {
    static create(entities: Promise<TItem[]>, pagingInfo?: CursorPagingType): Promise<AbstractConnection> {
      return connectionFromPromisedArray(entities, pagingInfo ?? {});
    }

    @Field(() => PIT)
    pageInfo!: PageInfoType;

    @Field(() => [E])
    edges!: EdgeType<TItem>[];
  }

  return AbstractConnection;
}
