import { Class, Filter, Query, SortField } from '@nestjs-query/core';
import { ArgsType, Field } from 'type-graphql';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FilterType } from './filter.type';
import { SortType } from './sorting.type';
import { CursorPagingType } from './paging.type';

export interface StaticQueryType<T> {
  SortType: Class<SortField<T>>;
  PageType: Class<CursorPagingType>;
  FilterType: Class<Filter<T>>;
  new (): QueryArgsType<T>;
}
export interface QueryArgsType<T> extends Query<T> {
  paging?: CursorPagingType;
}

export function QueryArgsType<T>(TClass: Class<T>): StaticQueryType<T> {
  const F = FilterType(TClass);
  const S = SortType(TClass);
  const P = CursorPagingType();

  @ArgsType()
  class QueryArgs implements QueryArgsType<T> {
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
  return QueryArgs;
}
