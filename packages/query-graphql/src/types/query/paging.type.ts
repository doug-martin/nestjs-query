import { Class, Paging } from '@nestjs-query/core';
import { Min, Validate, IsPositive } from 'class-validator';
import { Field, InputType, Int } from '@nestjs/graphql';
import { cursorToOffset } from 'graphql-relay';
import { ConnectionCursorType, ConnectionCursorScalar } from '../cursor.scalar';
import { CannotUseWith, CannotUseWithout, IsUndefined } from '../validators';

export interface CursorPagingType extends Paging {
  before?: ConnectionCursorType;
  after?: ConnectionCursorType;
  first?: number;
  last?: number;
}

/** @internal */
let graphQLCursorPaging: Class<CursorPagingType> | null = null;

export const CursorPagingType = (): Class<CursorPagingType> => {
  if (graphQLCursorPaging) {
    return graphQLCursorPaging;
  }
  // based on https://github.com/MichalLytek/type-graphql/issues/142#issuecomment-433120114
  @InputType('CursorPaging')
  class GraphQLCursorPagingImpl implements CursorPagingType {
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

    get limit(): number | undefined {
      if (this.isForwardPaging) {
        return this.first || 0;
      }
      if (this.isBackwardPaging) {
        const { last = 0, before } = this;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const offsetFromCursor = cursorToOffset(before!);
        const offset = offsetFromCursor - last;
        // Check to see if our before-page is underflowing past the 0th item
        if (offset < 0) {
          // Adjust the limit with the underflow value
          return Math.max(last + offset, 0);
        }
        return last;
      }
      return undefined;
    }

    get offset(): number | undefined {
      if (this.isForwardPaging) {
        const { after } = this;
        const limit = after ? cursorToOffset(after) + 1 : 0;
        return Math.max(limit, 0);
      }
      if (this.isBackwardPaging) {
        const { last, before } = this;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const offset = last ? cursorToOffset(before!) - last : 0;

        // Check to see if our before-page is underflowing past the 0th item
        return Math.max(offset, 0);
      }
      return undefined;
    }

    private get isForwardPaging(): boolean {
      return !!this.first || !!this.after;
    }

    private get isBackwardPaging(): boolean {
      return !!this.last || !!this.before;
    }
  }
  graphQLCursorPaging = GraphQLCursorPagingImpl;
  return graphQLCursorPaging;
};
