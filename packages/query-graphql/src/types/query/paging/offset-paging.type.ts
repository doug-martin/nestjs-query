import { Class } from '@nestjs-query/core';
import { IsInt } from 'class-validator';
import { Field, InputType, Int } from '@nestjs/graphql';
import { IsUndefined } from '../../validators';
import { PagingStrategies } from './constants';
import { OffsetPagingType } from './interfaces';

let graphQLPaging: Class<OffsetPagingType> | null = null;
// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentional
export const getOrCreateOffsetPagingType = (): Class<OffsetPagingType> => {
  if (graphQLPaging) {
    return graphQLPaging;
  }
  @InputType('OffsetPaging')
  class GraphQLPagingImpl implements OffsetPagingType {
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
