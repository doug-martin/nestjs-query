import { FilterableField } from '@nestjs-query/query-graphql';
import { ObjectType, ID, GraphQLISODateTime, Field } from 'type-graphql';

@ObjectType('TodoItemChecklist')
export class TodoItemChecklistDTO {
  @Field()
  name!: string;

  @Field({ defaultValue: false })
  completed!: boolean;
}

@ObjectType('TodoItem')
export class TodoItemDTO {
  @FilterableField(() => ID)
  id!: string;

  @FilterableField()
  title!: string;

  @FilterableField({ nullable: true })
  description?: string;

  @Field(() => [TodoItemChecklistDTO], { nullable: true })
  checklist?: TodoItemChecklistDTO[];

  @FilterableField()
  completed!: boolean;

  @FilterableField(() => GraphQLISODateTime)
  created!: Date;

  @FilterableField(() => GraphQLISODateTime)
  updated!: Date;

  @Field()
  age!: number;
}
