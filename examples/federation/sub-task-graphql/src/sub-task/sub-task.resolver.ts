import { QueryService } from '@nestjs-query/core';
import { CRUDResolver, RepresentationType } from '@nestjs-query/query-graphql';
import { Resolver, ResolveProperty, Parent } from '@nestjs/graphql';
import { InjectTypeOrmQueryService } from '@nestjs-query/query-typeorm';
import { SubTaskDTO } from './dto/sub-task.dto';
import { CreateSubTaskDTO } from './dto/subtask-input.dto';
import { SubTaskUpdateDTO } from './dto/subtask-update.dto';
import { TodoItemDTO } from './dto/todo-item.dto';
import { SubTaskEntity } from './sub-task.entity';

@Resolver(() => SubTaskDTO)
export class SubTaskResolver extends CRUDResolver(SubTaskDTO, {
  CreateDTOClass: CreateSubTaskDTO,
  UpdateDTOClass: SubTaskUpdateDTO,
}) {
  constructor(@InjectTypeOrmQueryService(SubTaskEntity) readonly service: QueryService<SubTaskEntity>) {
    super(service);
  }

  @ResolveProperty('todoItem', () => TodoItemDTO)
  getTodoItem(@Parent() subTask: SubTaskDTO): RepresentationType {
    return { __typename: 'TodoItem', id: subTask.todoItemId };
  }
}
