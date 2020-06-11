import { Paging } from '@nestjs-query/core';
import { IsInt } from 'class-validator';
import { Field, InputType, Int } from '@nestjs/graphql';
import { IsUndefined } from '../../validators';
import { PagingStrategies } from './constants';

let graphQLPaging: StaticLimitOffsetPagingType | null = null;

export interface StaticLimitOffsetPagingType {
  strategy: PagingStrategies.LIMIT_OFFSET;
  new (): LimitOffsetPagingType;
}

export type LimitOffsetPagingType = Paging;
export const LimitOffsetPagingType = (): StaticLimitOffsetPagingType => {
  if (graphQLPaging) {
    return graphQLPaging;
  }
  @InputType('LimitOffsetPaging')
  class GraphQLPagingImpl implements Paging {
    static strategy: PagingStrategies.LIMIT_OFFSET = PagingStrategies.LIMIT_OFFSET;

    @Field(() => Int, {
      nullable: true,
      description: 'Limit the number of records returned',
    })
    @IsUndefined()
    @IsInt()
    limit?: number;

    @Field(() => Int, {
      nullable: true,
      description: 'Offset to start returning records from',
    })
    @IsUndefined()
    @IsInt()
    offset?: number;
  }
  graphQLPaging = GraphQLPagingImpl;
  return graphQLPaging;
};
