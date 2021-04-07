import { Filter, InjectAssemblerQueryService, mergeFilter, mergeQuery, QueryService } from '@nestjs-query/core';
import {
  AuthorizerInterceptor,
  AuthorizerFilter,
  ConnectionType,
  AuthorizationOperationGroup,
} from '@nestjs-query/query-graphql';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { TodoItemDTO } from './dto/todo-item.dto';
import { TodoItemAssembler } from './todo-item.assembler';
import { TodoItemConnection, TodoItemQuery } from './types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Resolver(() => TodoItemDTO)
@UseGuards(JwtAuthGuard)
@UseInterceptors(AuthorizerInterceptor(TodoItemDTO))
export class TodoItemResolver {
  constructor(@InjectAssemblerQueryService(TodoItemAssembler) readonly service: QueryService<TodoItemDTO>) {}

  // Set the return type to the TodoItemConnection
  @Query(() => TodoItemConnection)
  async completedTodoItems(
    @Args() query: TodoItemQuery,
    @AuthorizerFilter({
      operationGroup: AuthorizationOperationGroup.READ,
      many: true,
    })
    authFilter: Filter<TodoItemDTO>,
  ): Promise<ConnectionType<TodoItemDTO>> {
    // add the completed filter the user provided filter
    const filter: Filter<TodoItemDTO> = mergeFilter(query.filter ?? {}, { completed: { is: true } });
    const completedQuery = mergeQuery(query, { filter: mergeFilter(filter, authFilter) });
    return TodoItemConnection.createFromPromise(
      (q) => this.service.query(q),
      completedQuery,
      (q) => this.service.count(q),
    );
  }

  // Set the return type to the TodoItemConnection
  @Query(() => TodoItemConnection)
  async uncompletedTodoItems(
    @Args() query: TodoItemQuery,
    @AuthorizerFilter({
      operationGroup: AuthorizationOperationGroup.READ,
      many: true,
    })
    authFilter: Filter<TodoItemDTO>,
  ): Promise<ConnectionType<TodoItemDTO>> {
    // add the completed filter the user provided filter
    const filter: Filter<TodoItemDTO> = mergeFilter(query.filter ?? {}, { completed: { is: false } });
    const uncompletedQuery = mergeQuery(query, { filter: mergeFilter(filter, authFilter) });
    return TodoItemConnection.createFromPromise(
      (q) => this.service.query(q),
      uncompletedQuery,
      (q) => this.service.count(q),
    );
  }
}
