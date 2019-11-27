import { Type } from '@nestjs/common';
import { connectionFromPromisedArray } from 'graphql-relay';
import { Field, ObjectType } from 'type-graphql';
import { CursorPagingType } from '../query/paging.type';
import { PageInfoType } from './page-info.type';
import { EdgeType } from './edge.type';

export interface StaticGraphQLConnectionType<TItem> {
  create(findMany: Promise<TItem[]>, pagingInfo?: CursorPagingType): Promise<GraphQLConnectionType<TItem>>;
  new (): GraphQLConnectionType<TItem>;
}

export interface GraphQLConnectionType<TItem> {
  pageInfo: PageInfoType;
  edges: EdgeType<TItem>[];
}

export function GraphQLConnection<TItem>(TItemClass: Type<TItem>): StaticGraphQLConnectionType<TItem> {
  const E = EdgeType(TItemClass);
  @ObjectType({ isAbstract: true })
  class AbstractConnection implements GraphQLConnectionType<TItem> {
    static create(entities: Promise<TItem[]>, pagingInfo?: CursorPagingType): Promise<AbstractConnection> {
      return connectionFromPromisedArray(entities, pagingInfo ?? {});
    }

    @Field()
    pageInfo!: PageInfoType;

    @Field(() => [E])
    edges!: EdgeType<TItem>[];
  }

  return AbstractConnection;
}
