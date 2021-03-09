import { Min, Validate, IsPositive } from 'class-validator';
import { Field, InputType, Int } from '@nestjs/graphql';
import { Class } from '@nestjs-query/core';
import { ConnectionCursorType, ConnectionCursorScalar } from '../../cursor.scalar';
import { CannotUseWith, CannotUseWithout, IsUndefined } from '../../validators';
import { PagingStrategies } from './constants';
import { CursorPagingType } from './interfaces';

/** @internal */
let graphQLCursorPaging: Class<CursorPagingType> | null = null;
// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentional
export const getOrCreateCursorPagingType = (): Class<CursorPagingType> => {
  if (graphQLCursorPaging) {
    return graphQLCursorPaging;
  }
  // based on https://github.com/MichalLytek/type-graphql/issues/142#issuecomment-433120114
  @InputType('CursorPaging')
  class GraphQLCursorPagingImpl implements CursorPagingType {
    static strategy: PagingStrategies.CURSOR = PagingStrategies.CURSOR;

    @Field(() => ConnectionCursorScalar, {
      nullable: true,
      description: 'Paginate before opaque cursor',
    })
    @IsUndefined()
    @Validate(CannotUseWithout, ['last'])
    @Validate(CannotUseWith, ['after', 'first'])
    before?: ConnectionCursorType;

    @Field(() => ConnectionCursorScalar, {
      nullable: true,
      description: 'Paginate after opaque cursor',
    })
    @IsUndefined()
    @Validate(CannotUseWithout, ['first'])
    @Validate(CannotUseWith, ['before', 'last'])
    after?: ConnectionCursorType;

    @Field(() => Int, { nullable: true, description: 'Paginate first' })
    @IsUndefined()
    @IsPositive()
    @Min(1)
    @Validate(CannotUseWith, ['before', 'last'])
    first?: number;

    @Field(() => Int, { nullable: true, description: 'Paginate last' })
    @IsUndefined()
    // Required `before`. This is a weird corner case.
    // We'd have to invert the ordering of query to get the last few items then re-invert it when emitting the results.
    // We'll just ignore it for now.
    @Validate(CannotUseWithout, ['before'])
    @Validate(CannotUseWith, ['after', 'first'])
    @Min(1)
    @IsPositive()
    last?: number;
  }
  graphQLCursorPaging = GraphQLCursorPagingImpl;
  return graphQLCursorPaging;
};
