import { Field, ObjectType } from '@nestjs/graphql';
import { Class } from '@nestjs-query/core';

export interface OffsetPageInfoTypeConstructor {
  new (hasNextPage: boolean, hasPreviousPage: boolean): OffsetPageInfoType;
}

export interface OffsetPageInfoType {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/** @internal */
let pageInfoType: Class<OffsetPageInfoType> | null = null;
// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentional
export const OffsetPageInfoType = (): OffsetPageInfoTypeConstructor => {
  if (pageInfoType) {
    return pageInfoType;
  }

  @ObjectType('OffsetPageInfo')
  class PageInfoTypeImpl implements OffsetPageInfoType {
    constructor(hasNextPage: boolean, hasPreviousPage: boolean) {
      this.hasNextPage = hasNextPage;
      this.hasPreviousPage = hasPreviousPage;
    }

    @Field(() => Boolean, { nullable: true, description: 'true if paging forward and there are more records.' })
    hasNextPage: boolean;

    @Field(() => Boolean, { nullable: true, description: 'true if paging backwards and there are more records.' })
    hasPreviousPage: boolean;
  }

  pageInfoType = PageInfoTypeImpl;
  return pageInfoType;
};
