import { ObjectType, GraphQLISODateTime, ID } from '@nestjs/graphql';
import { FilterableField, Relation, Reference } from '@nestjs-query/query-graphql';
import { TagDTO } from './tag.dto';
import { TodoItemReferenceDTO } from './todo-item-reference.dto';

@ObjectType('TagTodoItem')
@Relation('tag', () => TagDTO)
@Reference('todoItem', () => TodoItemReferenceDTO, { id: 'todoItemId' })
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
