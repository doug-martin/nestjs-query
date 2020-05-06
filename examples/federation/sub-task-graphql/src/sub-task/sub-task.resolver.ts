import { QueryService, InjectQueryService } from '@nestjs-query/core';
import { CRUDResolver } from '@nestjs-query/query-graphql';
import { Resolver } from '@nestjs/graphql';
import { SubTaskDTO } from './dto/sub-task.dto';
import { TodoItemReferenceDTO } from './dto/todo-item-reference.dto';
import { SubTaskEntity } from './sub-task.entity';
import { CreateSubTaskDTO } from './dto/subtask-input.dto';
import { SubTaskUpdateDTO } from './dto/subtask-update.dto';

@Resolver(() => SubTaskDTO)
export class SubTaskResolver extends CRUDResolver(SubTaskDTO, {
  CreateDTOClass: CreateSubTaskDTO,
  UpdateDTOClass: SubTaskUpdateDTO,
  references: {
    todoItem: { DTO: TodoItemReferenceDTO, keys: { id: 'todoItemId' } },
  },
}) {
  constructor(@InjectQueryService(SubTaskEntity) readonly service: QueryService<SubTaskEntity>) {
    super(service);
  }
}
