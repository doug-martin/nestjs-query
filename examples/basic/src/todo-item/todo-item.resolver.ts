import { CRUDResolver } from '@nestjs-query/query-graphql';
import { Resolver } from '@nestjs/graphql';
import { TodoItemDTO } from './dto/todo-item.dto';
import { TodoItemInputDTO } from './dto/todo-item-input.dto';
import { TodoItemUpdateDTO } from './dto/todo-item-update.dto';
import { TodoItemService } from './todo-item.service';

@Resolver(() => TodoItemDTO)
export class TodoItemResolver extends CRUDResolver(TodoItemDTO, {
  CreateDTOClass: TodoItemInputDTO,
  UpdateDTOClass: TodoItemUpdateDTO,
  enableTotalCount: true,
}) {
  constructor(queryService: TodoItemService) {
    super(queryService);
  }
}
