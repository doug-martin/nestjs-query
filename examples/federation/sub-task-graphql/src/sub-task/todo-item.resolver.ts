import { FederationResolver } from '@nestjs-query/query-graphql';
import { Resolver } from '@nestjs/graphql';
import { TodoItemDTO } from './dto/todo-item.dto';
import { SubTaskDTO } from './dto/sub-task.dto';
import { TodoItemService } from './todo-item.service';

@Resolver(() => TodoItemDTO)
export class TodoItemResolver extends FederationResolver(TodoItemDTO, {
  many: {
    subTasks: { DTO: SubTaskDTO },
  },
}) {
  constructor(readonly service: TodoItemService) {
    super(service);
  }
}
