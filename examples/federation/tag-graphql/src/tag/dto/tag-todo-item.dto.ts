import { ObjectType, GraphQLISODateTime, ID } from '@nestjs/graphql';
import { FilterableField } from '@nestjs-query/query-graphql';

@ObjectType('TagTodoItem')
export class TagTodoItemDTO {
  @FilterableField(() => ID)
  tagId!: number;

  @FilterableField(() => ID)
  todoItemId!: number;

  @FilterableField(() => GraphQLISODateTime)
  created!: Date;

  @FilterableField(() => GraphQLISODateTime)
  updated!: Date;
}

