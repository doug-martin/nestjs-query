import { FederationResolver } from '@nestjs-query/query-graphql';
import { Resolver } from '@nestjs/graphql';
import { TagTodoItemDTO } from './dto/tag-todo-item.dto';
import { TodoItemReferenceDTO } from './dto/todo-item-reference.dto';
import { TodoItemService } from './todo-item.service';

@Resolver(() => TodoItemReferenceDTO)
export class TodoItemResolver extends FederationResolver(TodoItemReferenceDTO, {
  many: {
    tagTodoItems: { DTO: TagTodoItemDTO },
  },
}) {
  constructor(readonly service: TodoItemService) {
    super(service);
  }
}
