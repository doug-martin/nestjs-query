import {
  FilterableField,
  GraphQLConnection,
  GraphQLQuery,
} from '@nestjs-query/query-graphql';
import {
  ObjectType,
  Field,
  ID,
  GraphQLISODateTime,
  ArgsType, InputType,
} from 'type-graphql';

@ObjectType('TodoItem')
export class TodoItemDTO {
  @FilterableField(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
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
