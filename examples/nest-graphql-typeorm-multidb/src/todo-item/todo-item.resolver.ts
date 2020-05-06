import { InjectQueryService, QueryService } from '@nestjs-query/core';
import { CRUDResolver } from '@nestjs-query/query-graphql';
import { Resolver } from '@nestjs/graphql';
import { TodoItemInputDTO } from './dto/todo-item-input.dto';
import { TodoItemDTO } from './dto/todo-item.dto';
import { TodoItemEntity } from './todo-item.entity';

@Resolver(() => TodoItemDTO)
export class TodoItemResolver extends CRUDResolver(TodoItemDTO, {
  CreateDTOClass: TodoItemInputDTO,
}) {
  constructor(@InjectQueryService(TodoItemEntity) readonly service: QueryService<TodoItemEntity>) {
    super(service);
  }
}
