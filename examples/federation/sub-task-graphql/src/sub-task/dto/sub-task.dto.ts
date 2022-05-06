import { FilterableField, Reference } from '@ptc-org/nestjs-query-graphql';
import { ObjectType, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { TodoItemReferenceDTO } from './todo-item-reference.dto';

@ObjectType('SubTask')
@Reference('todoItem', () => TodoItemReferenceDTO, { id: 'todoItemId' })
export class SubTaskDTO {
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

  @FilterableField()
  todoItemId!: number;
}
