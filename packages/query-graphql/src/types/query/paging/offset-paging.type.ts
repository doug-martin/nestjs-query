import { Paging } from '@nestjs-query/core';
import { IsInt } from 'class-validator';
import { Field, InputType, Int } from '@nestjs/graphql';
import { IsUndefined } from '../../validators';
import { PagingStrategies } from './constants';

let graphQLPaging: StaticOffsetPagingType | null = null;

export interface StaticOffsetPagingType {
  strategy: PagingStrategies.OFFSET;
  new (): OffsetPagingType;
}

export type OffsetPagingType = Paging;
// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentional
export const OffsetPagingType = (): StaticOffsetPagingType => {
  if (graphQLPaging) {
    return graphQLPaging;
  }
  @InputType('OffsetPaging')
  class GraphQLPagingImpl implements Paging {
    static strategy: PagingStrategies.OFFSET = PagingStrategies.OFFSET;

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
