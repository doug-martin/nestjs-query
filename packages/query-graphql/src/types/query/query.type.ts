import { Filter, Query, SortField } from '@nestjs-query/core';
import { Type } from '@nestjs/common';
import { ArgsType, Field, InputType } from 'type-graphql';
import { ValidateNested } from 'class-validator';
import { Type as TransformType } from 'class-transformer';
import { GraphQLFilterType } from './filter.type';
import { GraphQLSortType } from './sorting.type';
import { CursorPagingType, GraphQLCursorPaging } from './paging.type';

export interface StaticGraphQLQueryType<T> {
  SortType: Type<SortField<T>>;
  PageType: Type<CursorPagingType>;
  FilterType: Type<Filter<T>>;
}
export interface GraphQLQueryType<T> extends Query<T> {
  paging?: CursorPagingType;
}

export const GraphQLQuery = <T>(TClass: Type<T>): Type<GraphQLQueryType<T>> & StaticGraphQLQueryType<T> => {
  const F = GraphQLFilterType(TClass);
  const S = GraphQLSortType(TClass);

  @ArgsType()
  @InputType({ isAbstract: true })
  class QueryImpl implements Query<T> {
    static SortType = S;

    static FilterType = F;

    static PageType = GraphQLCursorPaging;

    @Field(() => GraphQLCursorPaging, { defaultValue: new GraphQLCursorPaging() })
    @ValidateNested()
    @TransformType(() => GraphQLCursorPaging)
    paging?: CursorPagingType;

    @Field(() => F, { defaultValue: new F() })
    @ValidateNested()
    @TransformType(() => F)
    filter?: Filter<T>;

    @Field(() => [S], { defaultValue: [] })
    @ValidateNested()
    @TransformType(() => S)
    sorting?: SortField<T>[];
  }
  return QueryImpl;
};
