import { Field, ObjectType } from 'type-graphql';
import { Class } from '@nestjs-query/core';
import { ConnectionCursorType, ConnectionCursorScalar } from '../cursor.scalar';

export interface PageInfoType {
  hasNextPage?: boolean | null;
  hasPreviousPage?: boolean | null;
  startCursor?: ConnectionCursorType | null;
  endCursor?: ConnectionCursorType | null;
}
/** @internal */
let pageInfoType: Class<PageInfoType> | null = null;
export const PageInfoType = (): Class<PageInfoType> => {
  if (pageInfoType) {
    return pageInfoType;
  }
  @ObjectType('PageInfo')
  class PageInfoTypeImpl {
    @Field(() => Boolean, { nullable: true, description: 'true if paging forward and there are more records.' })
    hasNextPage?: boolean | null;

    @Field(() => Boolean, { nullable: true, description: 'true if paging backwards and there are more records.' })
    hasPreviousPage?: boolean | null;

    @Field(() => ConnectionCursorScalar, { nullable: true, description: 'The cursor of the first returned record.' })
    startCursor?: ConnectionCursorType | null;

    @Field(() => ConnectionCursorScalar, {
      nullable: true,
      description: 'The cursor of the last returned record.',
    })
    endCursor?: ConnectionCursorType | null;
  }
  pageInfoType = PageInfoTypeImpl;
  return pageInfoType;
};
