import { FilterableField } from '@ptc-org/nestjs-query-graphql';
import { ObjectType, ID, GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType('TodoItem')
export class TodoItemDTO {
  @FilterableField(() => ID)
  id!: number;

  @FilterableField()
  title!: string;

  @FilterableField({ nullable: true })
  description?: string;

  @FilterableField({
    filterRequired: true
  })
  completed!: boolean;

  @FilterableField(() => GraphQLISODateTime, { filterOnly: true })
  created!: Date;

  @FilterableField(() => GraphQLISODateTime, { filterOnly: true })
  updated!: Date;
}
