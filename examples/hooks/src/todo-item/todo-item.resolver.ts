import { InjectQueryService, mergeFilter, QueryService, UpdateManyResponse } from '@nestjs-query/core';
import { HookTypes, HookInterceptor, MutationHookArgs, UpdateManyResponseType } from '@nestjs-query/query-graphql';
import { UseInterceptors } from '@nestjs/common';
import { Mutation, Resolver } from '@nestjs/graphql';
import { TodoItemDTO } from './dto/todo-item.dto';
import { TodoItemEntity } from './todo-item.entity';
import { UpdateManyTodoItemsArgs } from './types';

@Resolver(() => TodoItemDTO)
export class TodoItemResolver {
  constructor(@InjectQueryService(TodoItemEntity) readonly service: QueryService<TodoItemDTO>) {}

  // Set the return type to the TodoItemConnection
  @Mutation(() => UpdateManyResponseType())
  @UseInterceptors(HookInterceptor(HookTypes.BEFORE_UPDATE_MANY, TodoItemDTO))
  markTodoItemsAsCompleted(@MutationHookArgs() { input }: UpdateManyTodoItemsArgs): Promise<UpdateManyResponse> {
    return this.service.updateMany(
      { ...input.update, completed: false },
      mergeFilter(input.filter, { completed: { is: false } }),
    );
  }
}
