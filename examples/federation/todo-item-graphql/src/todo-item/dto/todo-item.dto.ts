import { FilterableField } from '@nestjs-query/query-graphql';
import { ObjectType, ID, GraphQLISODateTime, Directive } from '@nestjs/graphql';

@ObjectType('TodoItem')
@Directive('@key(fields: "id")')
export class TodoItemDTO {
  @FilterableField(() => ID)
  id!: number;

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
}
