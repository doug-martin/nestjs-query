import { FilterableField, QueryOptions, Relation } from '@codeshine/nestjs-query-graphql';
import { ObjectType, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { TodoItemDTO } from '../../todo-item/dto/todo-item.dto';

@ObjectType('SubTask')
@QueryOptions({ enableTotalCount: true })
@Relation('todoItem', () => TodoItemDTO, { disableRemove: true, complexity: 5 })
export class SubTaskDTO {
  @FilterableField(() => ID, { complexity: 1 })
  id!: number;

  @FilterableField({ complexity: 1 })
  title!: string;

  @FilterableField({ nullable: true, complexity: 1 })
  description?: string;

  @FilterableField({ complexity: 1 })
  completed!: boolean;

  @FilterableField(() => GraphQLISODateTime, { complexity: 1 })
  created!: Date;

  @FilterableField(() => GraphQLISODateTime, { complexity: 1 })
  updated!: Date;

  @FilterableField({ complexity: 1 })
  todoItemId!: string;
}
