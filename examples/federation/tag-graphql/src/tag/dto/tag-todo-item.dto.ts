import { ObjectType, GraphQLISODateTime, ID } from '@nestjs/graphql';
import { FilterableField, Relation } from '@nestjs-query/query-graphql';
import { TagDTO } from './tag.dto';

@ObjectType('TagTodoItem')
@Relation('tag', () => TagDTO)
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
