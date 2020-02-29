import { CRUDResolver } from '@nestjs-query/query-graphql';
import { Resolver } from '@nestjs/graphql';
import { TodoItemDTO } from '../todo-item/dto/todo-item.dto';
import { SubTaskDTO } from './dto/sub-task.dto';
import { CreateSubTaskDTO } from './dto/subtask-input.dto';
import { SubTaskUpdateDTO } from './dto/subtask-update.dto';
import { SubTaskService } from './sub-task.service';

@Resolver(() => SubTaskDTO)
export class SubTaskResolver extends CRUDResolver(SubTaskDTO, {
  CreateDTOClass: CreateSubTaskDTO,
  UpdateDTOClass: SubTaskUpdateDTO,
  relations: {
    one: { todoItem: { DTO: TodoItemDTO, disableRemove: true } },
  },
}) {
  constructor(readonly service: SubTaskService) {
    super(service);
  }
}
