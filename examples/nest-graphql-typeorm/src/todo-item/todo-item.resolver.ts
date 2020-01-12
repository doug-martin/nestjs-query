import { Resolver } from '@nestjs/graphql';

import { CRUDResolver } from '@nestjs-query/query-graphql';
import { TodoItemDTO } from './dto/todo-item.dto';
import { TodoItemService } from './todo-item.service';
import { CreateTodoItem } from './dto/create-todo-item.dto';
import { UpdateTodoItem } from './dto/update-todo-item.dto';

@Resolver(() => TodoItemDTO)
export class TodoItemResolver extends CRUDResolver(TodoItemDTO, {
  CreateDTOClass: CreateTodoItem,
  UpdateDTOClass: UpdateTodoItem,
}) {
  constructor(readonly service: TodoItemService) {
    super(service);
  }
}
