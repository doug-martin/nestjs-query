import {
  FilterableField,
  GraphQLConnection,
  GraphQLQuery,
} from '@nestjs-query/query-graphql';
import {
  ObjectType,
  ID,
  GraphQLISODateTime,
  ArgsType,
  InputType,
} from 'type-graphql';

@ObjectType('TodoItem')
export class TodoItemDTO {
  @FilterableField(() => ID)
  id: string;

  @FilterableField()
  title: string;

  @FilterableField()
  completed: boolean;

  @FilterableField(() => GraphQLISODateTime)
  created!: Date;

  @FilterableField(() => GraphQLISODateTime)
  updated!: Date;
}

@ObjectType()
export class TodoItemConnection extends GraphQLConnection(TodoItemDTO) {}

@ArgsType()
@InputType()
export class TodoItemQuery extends GraphQLQuery(TodoItemDTO) {}
