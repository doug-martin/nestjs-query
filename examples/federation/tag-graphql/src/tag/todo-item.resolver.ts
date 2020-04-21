import { FederationResolver } from '@nestjs-query/query-graphql';
import { Resolver } from '@nestjs/graphql';
import { TagTodoItemDTO } from './dto/tag-todo-item.dto';
import { TodoItemDTO } from './dto/todo-item.dto';
import { TodoItemService } from './todo-item.service';

@Resolver(() => TodoItemDTO)
export class TodoItemResolver extends FederationResolver(TodoItemDTO, {
  many: {
    tagTodoItems: { DTO: TagTodoItemDTO },
  },
}) {
  constructor(readonly service: TodoItemService) {
    super(service);
  }
}
