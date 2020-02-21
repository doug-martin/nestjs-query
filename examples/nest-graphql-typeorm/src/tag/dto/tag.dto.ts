import { FilterableField } from '@nestjs-query/query-graphql';
import { ObjectType, ID, GraphQLISODateTime } from 'type-graphql';

@ObjectType('Tag')
export class TagDTO {
  @FilterableField(() => ID)
  id!: string;

  @FilterableField()
  name!: string;

  @FilterableField(() => GraphQLISODateTime)
  created!: Date;

  @FilterableField(() => GraphQLISODateTime)
  updated!: Date;
}
