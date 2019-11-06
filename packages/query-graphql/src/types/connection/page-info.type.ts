import { Field, ObjectType } from 'type-graphql';
import { ConnectionCursor, ConnectionCursorScalar } from '../cursor.scalar';

@ObjectType('PageInfo')
export class PageInfoType {
  @Field(() => Boolean, { nullable: true })
  hasNextPage?: boolean | null;

  @Field(() => Boolean, { nullable: true })
  hasPreviousPage?: boolean | null;

  @Field(() => ConnectionCursorScalar, { nullable: true })
  startCursor?: ConnectionCursor | null;

  @Field(() => ConnectionCursorScalar, { nullable: true })
  endCursor?: ConnectionCursor | null;
}
