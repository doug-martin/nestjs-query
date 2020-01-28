import { Filter } from '@nestjs-query/core';
import { CRUDResolver, ConnectionType } from '@nestjs-query/query-graphql';
import { Resolver, Args, Query } from '@nestjs/graphql';
import { AuthGuard } from '../auth.guard';
import { TodoItemDTO } from './dto/todo-item.dto';
import { TodoItemService } from './todo-item.service';
import { TodoItemConnection, TodoItemQuery } from './types';

const guards = [AuthGuard];

@Resolver()
export class TodoItemResolver extends CRUDResolver(TodoItemDTO, {
  create: { guards },
  update: { guards },
  delete: { guards },
}) {
  constructor(readonly service: TodoItemService) {
    super(service);
  }

  // Set the return type to the TodoItemConnection
  @Query(() => TodoItemConnection)
  completedTodoItems(@Args() query: TodoItemQuery): Promise<ConnectionType<TodoItemDTO>> {
    // add the completed filter the user provided filter
    const filter: Filter<TodoItemDTO> = {
      ...query.filter,
      ...{ completed: { is: true } },
    };

    // call the original queryMany method with the new query
    return this.queryMany({ ...query, ...{ filter } });
  }

  // Set the return type to the TodoItemConnection
  @Query(() => TodoItemConnection)
  uncompletedTodoItems(@Args() query: TodoItemQuery): Promise<ConnectionType<TodoItemDTO>> {
    // add the completed filter the user provided filter
    const filter: Filter<TodoItemDTO> = {
      ...query.filter,
      ...{ completed: { is: false } },
    };

    // call the original queryMany method with the new query
    return this.queryMany({ ...query, ...{ filter } });
  }
}
