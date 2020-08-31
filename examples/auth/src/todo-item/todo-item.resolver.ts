import { Filter, InjectAssemblerQueryService, mergeFilter, mergeQuery, QueryService } from '@nestjs-query/core';
import { Authorizer, ConnectionType, InjectAuthorizer } from '@nestjs-query/query-graphql';
import { Args, Query, Resolver, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TodoItemDTO } from './dto/todo-item.dto';
import { TodoItemAssembler } from './todo-item.assembler';
import { TodoItemConnection, TodoItemQuery } from './types';
import { UserContext } from '../auth/auth.interfaces';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Resolver(() => TodoItemDTO)
@UseGuards(JwtAuthGuard)
export class TodoItemResolver {
  constructor(
    @InjectAssemblerQueryService(TodoItemAssembler) readonly service: QueryService<TodoItemDTO>,
    @InjectAuthorizer(TodoItemDTO) readonly authorizer: Authorizer<TodoItemDTO>,
  ) {}

  // Set the return type to the TodoItemConnection
  @Query(() => TodoItemConnection)
  async completedTodoItems(
    @Args() query: TodoItemQuery,
    @Context() context: UserContext,
  ): Promise<ConnectionType<TodoItemDTO>> {
    const authFilter = await this.authorizer.authorize(context);
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
    @Context() context: UserContext,
  ): Promise<ConnectionType<TodoItemDTO>> {
    const authFilter = await this.authorizer.authorize(context);
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
