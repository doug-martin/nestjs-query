import { FilterableField } from '@nestjs-query/query-graphql';
import { ObjectType, ID, GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType('User')
export class UserDTO {
  @FilterableField(() => ID)
  id!: number;

  @FilterableField()
  firstName!: string;

  @FilterableField()
  lastName!: string;

  @FilterableField()
  emailAddress!: string;

  @FilterableField(() => GraphQLISODateTime)
  created!: Date;

  @FilterableField(() => GraphQLISODateTime)
  updated!: Date;
}
