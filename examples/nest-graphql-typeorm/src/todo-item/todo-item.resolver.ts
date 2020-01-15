import { CRUDResolver } from '@nestjs-query/query-graphql';
import { Resolver } from '@nestjs/graphql';
import { AuthGuard } from '../auth.guard';
import { TodoItemDTO } from './dto/todo-item.dto';
import { TodoItemService } from './todo-item.service';

const guards = [AuthGuard];

@Resolver(() => TodoItemDTO)
export class TodoItemResolver extends CRUDResolver(TodoItemDTO, {
  create: { many: { guards } },
  update: { many: { guards } },
  delete: { many: { guards } },
}) {
  constructor(readonly service: TodoItemService) {
    super(service);
  }
}
