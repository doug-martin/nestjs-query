import { FilterableField } from '@codeshine/nestjs-query-graphql';
import { ObjectType, ID, GraphQLISODateTime, Directive } from '@nestjs/graphql';

@ObjectType('User')
@Directive('@key(fields: "id")')
export class UserDTO {
  @FilterableField(() => ID)
  id!: number;

  @FilterableField()
  name!: string;

  @FilterableField()
  email!: string;

  @FilterableField(() => GraphQLISODateTime)
  created!: Date;

  @FilterableField(() => GraphQLISODateTime)
  updated!: Date;
}
