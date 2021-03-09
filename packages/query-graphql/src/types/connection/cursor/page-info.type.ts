import { Field, ObjectType } from '@nestjs/graphql';
import { Class } from '@nestjs-query/core';
import { ConnectionCursorType, ConnectionCursorScalar } from '../../cursor.scalar';
import { PageInfoType } from '../interfaces';

export interface PageInfoTypeConstructor {
  new (
    hasNextPage: boolean,
    hasPreviousPage: boolean,
    startCursor: ConnectionCursorType | undefined,
    endCursor: ConnectionCursorType | undefined,
  ): PageInfoType;
}

/** @internal */
let pageInfoType: Class<PageInfoType> | null = null;
// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentional
export const getOrCreatePageInfoType = (): PageInfoTypeConstructor => {
  if (pageInfoType) {
    return pageInfoType;
  }

  @ObjectType('PageInfo')
  class PageInfoTypeImpl implements PageInfoType {
    constructor(
      hasNextPage: boolean,
      hasPreviousPage: boolean,
      startCursor: ConnectionCursorType | undefined,
      endCursor: ConnectionCursorType | undefined,
    ) {
      this.hasNextPage = hasNextPage;
      this.hasPreviousPage = hasPreviousPage;
      this.startCursor = startCursor;
      this.endCursor = endCursor;
    }

    @Field(() => Boolean, { nullable: true, description: 'true if paging forward and there are more records.' })
    hasNextPage: boolean;

    @Field(() => Boolean, { nullable: true, description: 'true if paging backwards and there are more records.' })
    hasPreviousPage: boolean;

    @Field(() => ConnectionCursorScalar, { nullable: true, description: 'The cursor of the first returned record.' })
    startCursor?: ConnectionCursorType | undefined;

    @Field(() => ConnectionCursorScalar, {
      nullable: true,
      description: 'The cursor of the last returned record.',
    })
    endCursor?: ConnectionCursorType | undefined;
  }

  pageInfoType = PageInfoTypeImpl;
  return pageInfoType;
};
