import { Args, ID, Mutation, Resolver } from '@nestjs/graphql'
import { Filter, UpdateManyResponse } from '@ptc-org/nestjs-query-core'
import { FilterType, UpdateManyResponseType } from '@ptc-org/nestjs-query-graphql'

import { TodoItemDTO } from './dto/todo-item.dto'
import { TodoItemService } from './todo-item.service'

@Resolver(() => TodoItemDTO)
export class TodoItemResolver {
  constructor(readonly service: TodoItemService) {}

  @Mutation(() => TodoItemDTO)
  restoreOneTodoItem(@Args('input', { type: () => ID }) id: number): Promise<TodoItemDTO> {
    return this.service.restoreOne(id)
  }

  @Mutation(() => UpdateManyResponseType())
  restoreManyTodoItems(
    @Args('input', { type: () => FilterType(TodoItemDTO) }) filter: Filter<TodoItemDTO>
  ): Promise<UpdateManyResponse> {
    return this.service.restoreMany(filter)
  }
}
