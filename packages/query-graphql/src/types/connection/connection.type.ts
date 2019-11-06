import { FindManyResponse } from '@nestjs-query/core';
import { Type } from '@nestjs/common';
import { connectionFromArraySlice } from 'graphql-relay';
import { Field, ObjectType } from 'type-graphql';
import { CursorPagingType } from '../query/paging.type';
import { PageInfoType } from './page-info.type';
import { EdgeType } from './edge.type';

export interface StaticGraphQLConnectionType<TItem> {
  create(pagingInfo: CursorPagingType | undefined, findMany: FindManyResponse<TItem>): GraphQLConnectionType<TItem>;
}

export interface GraphQLConnectionType<TItem> {
  pageInfo: PageInfoType;
  edges: EdgeType<TItem>[];
}

export const GraphQLConnection = <TItem>(
  TItemClass: Type<TItem>,
): Type<GraphQLConnectionType<TItem>> & StaticGraphQLConnectionType<TItem> => {
  const E = EdgeType(TItemClass);
  @ObjectType({ isAbstract: true })
  class AbstractConnection implements GraphQLConnectionType<TItem> {
    static create(pagingInfo: CursorPagingType | undefined, findMany: FindManyResponse<TItem>): AbstractConnection {
      const { entities, totalCount } = findMany;
      return connectionFromArraySlice(entities, pagingInfo || {}, {
        arrayLength: totalCount,
        sliceStart: pagingInfo ? pagingInfo.offset || 0 : 0,
      });
    }

    @Field()
    pageInfo!: PageInfoType;

    @Field(() => [E])
    edges!: EdgeType<TItem>[];
  }

  return AbstractConnection;
};
