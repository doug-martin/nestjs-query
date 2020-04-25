import { UpdateManyResponse, Filter } from '@nestjs-query/core';
import { CRUDResolver, FilterType, UpdateManyResponseType } from '@nestjs-query/query-graphql';
import { Resolver, Args, Mutation, ID } from '@nestjs/graphql';
import { TodoItemInputDTO } from './dto/todo-item-input.dto';
import { TodoItemUpdateDTO } from './dto/todo-item-update.dto';
import { TodoItemDTO } from './dto/todo-item.dto';
import { TodoItemService } from './todo-item.service';

@Resolver(() => TodoItemDTO)
export class TodoItemResolver extends CRUDResolver(TodoItemDTO, {
  CreateDTOClass: TodoItemInputDTO,
  UpdateDTOClass: TodoItemUpdateDTO,
}) {
  constructor(readonly service: TodoItemService) {
    super(service);
  }

  @Mutation(() => TodoItemDTO)
  restoreOneTodoItem(@Args('input', { type: () => ID }) id: number): Promise<TodoItemDTO> {
    return this.service.restoreOne(id);
  }

  @Mutation(() => UpdateManyResponseType())
  restoreManyTodoItems(
    @Args('input', { type: () => FilterType(TodoItemDTO) }) filter: Filter<TodoItemDTO>,
  ): Promise<UpdateManyResponse> {
    return this.service.restoreMany(filter);
  }
}
