import { Class, Filter, Query, SortField } from '@nestjs-query/core';
import { ArgsType, Field, InputType } from 'type-graphql';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FilterType } from './filter.type';
import { SortType } from './sorting.type';
import { CursorPagingType } from './paging.type';

export interface StaticQueryType<T> {
  SortType: Class<SortField<T>>;
  PageType: Class<CursorPagingType>;
  FilterType: Class<Filter<T>>;
  new (): QueryType<T>;
}
export interface QueryType<T> extends Query<T> {
  paging?: CursorPagingType;
}

export function QueryType<T>(TClass: Class<T>): StaticQueryType<T> {
  const F = FilterType(TClass);
  const S = SortType(TClass);
  const P = CursorPagingType();

  @ArgsType()
  @InputType({ isAbstract: true })
  class QueryImpl implements Query<T> {
    static SortType = S;

    static FilterType = F;

    static PageType = P;

    @Field(() => P, { defaultValue: new P() })
    @ValidateNested()
    @Type(() => P)
    paging?: CursorPagingType;

    @Field(() => F, { defaultValue: new F() })
    @ValidateNested()
    @Type(() => F)
    filter?: Filter<T>;

    @Field(() => [S], { defaultValue: [] })
    @ValidateNested()
    @Type(() => S)
    sorting?: SortField<T>[];
  }
  return QueryImpl;
}
