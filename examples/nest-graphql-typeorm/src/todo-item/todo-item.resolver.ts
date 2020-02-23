import { Filter } from '@nestjs-query/core';
import { ConnectionType, CRUDResolver } from '@nestjs-query/query-graphql';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { AuthGuard } from '../auth.guard';
import { SubTaskDTO } from '../sub-task/dto/sub-task.dto';
import { TagDTO } from '../tag/dto/tag.dto';
import { TodoItemInputDTO } from './dto/todo-item-input.dto';
import { TodoItemDTO } from './dto/todo-item.dto';
import { TodoItemService } from './todo-item.service';
import { TodoItemConnection, TodoItemQuery } from './types';
import { CreateOneTodoItemArgs } from './args/custom-args.types';

const guards = [AuthGuard];

@Resolver(() => TodoItemDTO)
export class TodoItemResolver extends CRUDResolver(TodoItemDTO, {
  UpdateDTOClass: TodoItemInputDTO,
  create: {
    guards,
    CreateOneArgs: CreateOneTodoItemArgs,
    CreateDTOClass: TodoItemInputDTO,
  },
  update: { guards },
  delete: { guards },
  relations: {
    many: {
      subTasks: { DTO: SubTaskDTO, disableRemove: true, guards },
      tags: { DTO: TagDTO, guards },
    },
  },
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
