import { FilterableField } from '@nestjs-query/query-graphql';
import { ObjectType, ID, GraphQLISODateTime } from 'type-graphql';

@ObjectType('SubTask')
export class SubTaskDTO {
  @FilterableField(() => ID)
  id!: string;

  @FilterableField()
  title!: string;

  @FilterableField({ nullable: true })
  description?: string;

  @FilterableField()
  completed!: boolean;

  @FilterableField(() => GraphQLISODateTime)
  created!: Date;

  @FilterableField(() => GraphQLISODateTime)
  updated!: Date;

  @FilterableField()
  todoItemId!: string;
}
