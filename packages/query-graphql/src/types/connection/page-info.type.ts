import { Field, ObjectType } from 'type-graphql';
import { Class } from '@nestjs-query/core';
import { ConnectionCursorType, ConnectionCursorScalar } from '../cursor.scalar';

export interface PageInfoType {
  hasNextPage?: boolean | null;
  hasPreviousPage?: boolean | null;
  startCursor?: ConnectionCursorType | null;
  endCursor?: ConnectionCursorType | null;
}

let pageInfoType: Class<PageInfoType> | null = null;
export const PageInfoType = (): Class<PageInfoType> => {
  if (pageInfoType) {
    return pageInfoType;
  }
  @ObjectType('PageInfo')
  class PageInfoTypeImpl {
    @Field(() => Boolean, { nullable: true })
    hasNextPage?: boolean | null;

    @Field(() => Boolean, { nullable: true })
    hasPreviousPage?: boolean | null;

    @Field(() => ConnectionCursorScalar, { nullable: true })
    startCursor?: ConnectionCursorType | null;

    @Field(() => ConnectionCursorScalar, { nullable: true })
    endCursor?: ConnectionCursorType | null;
  }
  pageInfoType = PageInfoTypeImpl;
  return pageInfoType;
};
