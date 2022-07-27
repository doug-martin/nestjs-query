import { ObjectType, GraphQLISODateTime } from '@nestjs/graphql';
import { FilterableField } from '@codeshine/nestjs-query-graphql';

@ObjectType('User')
export class UserDTO {
  @FilterableField()
  id!: number;

  @FilterableField()
  username!: string;

  @FilterableField(() => GraphQLISODateTime)
  created!: Date;

  @FilterableField(() => GraphQLISODateTime)
  updated!: Date;
}
