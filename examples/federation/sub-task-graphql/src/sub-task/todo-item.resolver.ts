import { FederationResolver } from '@nestjs-query/query-graphql';
import { Resolver } from '@nestjs/graphql';
import { SubTaskDTO } from './dto/sub-task.dto';
import { TodoItemReferenceDTO } from './dto/todo-item-reference.dto';
import { TodoItemService } from './todo-item.service';

@Resolver(() => TodoItemReferenceDTO)
export class TodoItemResolver extends FederationResolver(TodoItemReferenceDTO, {
  many: {
    subTasks: { DTO: SubTaskDTO },
  },
}) {
  constructor(readonly service: TodoItemService) {
    super(service);
  }
}
