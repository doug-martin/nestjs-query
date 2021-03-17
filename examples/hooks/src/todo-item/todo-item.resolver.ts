import { InjectQueryService, mergeFilter, QueryService, UpdateManyResponse } from '@nestjs-query/core';
import { HookTypes, HookInterceptor, MutationHookArgs, UpdateManyResponseType } from '@nestjs-query/query-graphql';
import { UseInterceptors, UseGuards } from '@nestjs/common';
import { Mutation, Resolver } from '@nestjs/graphql';
import { TodoItemDTO } from './dto/todo-item.dto';
import { TodoItemEntity } from './todo-item.entity';
import { MarkTodoItemsAsCompletedArgs } from './types';
import { AuthGuard } from '../auth/auth.guard';
import { TodoItemUpdateDTO } from './dto/todo-item-update.dto';

@Resolver(() => TodoItemDTO)
export class TodoItemResolver {
  constructor(@InjectQueryService(TodoItemEntity) readonly service: QueryService<TodoItemDTO>) {}

  // Set the return type to the TodoItemConnection
  @Mutation(() => UpdateManyResponseType())
  @UseGuards(AuthGuard)
  @UseInterceptors(HookInterceptor(HookTypes.BEFORE_UPDATE_MANY, TodoItemUpdateDTO))
  markTodoItemsAsCompleted(@MutationHookArgs() { input }: MarkTodoItemsAsCompletedArgs): Promise<UpdateManyResponse> {
    return this.service.updateMany(
      { ...input.update, completed: true },
      mergeFilter(input.filter, { completed: { is: false } }),
    );
  }
}
