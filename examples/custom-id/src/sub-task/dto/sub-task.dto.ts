import { FilterableField, IDField, Relation } from '@nestjs-query/query-graphql';
import { ObjectType, GraphQLISODateTime } from '@nestjs/graphql';
import { TodoItemDTO } from '../../todo-item/dto/todo-item.dto';
import { CustomIDScalar } from '../../common/custom-id.scalar';

@ObjectType('SubTask')
@Relation('todoItem', () => TodoItemDTO, { disableRemove: true })
export class SubTaskDTO {
  @IDField(() => CustomIDScalar)
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

  @FilterableField(() => CustomIDScalar)
  todoItemId!: number;
}
