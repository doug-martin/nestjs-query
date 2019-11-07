import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Int } from 'type-graphql';
import {
  CreateTodoItemDTO,
  CreateTodoItemsDTO,
} from './dto/create-todo-item.dto';
import {
  DeleteTodoItemDTO,
  DeleteTodoItemsDTO,
} from './dto/delete-todo-item.dto';
import {
  TodoItemConnection,
  TodoItemDTO,
  TodoItemQuery,
} from './dto/todo-item.dto';
import {
  UpdateTodoItemDTO,
  UpdateTodoItemsDTO,
} from './dto/update-todo-item.dto';
import { TodoItemEntity } from './todo-item.entity';
import { TodoItemService } from './todo-item.service';

@Resolver('TodoItem')
export class TodoItemResolver {
  constructor(private readonly service: TodoItemService) {}

  @Query()
  async todoItems(@Args() query: TodoItemQuery): Promise<TodoItemConnection> {
    return TodoItemConnection.create(
      query.paging,
      await this.service.query(query),
    );
  }

  @Mutation(() => TodoItemDTO)
  async updateTodoItem(
    @Args('input') input: UpdateTodoItemDTO,
  ): Promise<TodoItemEntity> {
    return this.service.updateOne(
      { filter: { id: { eq: input.id } } },
      input.update,
    );
  }

  @Mutation(() => Int)
  async updateTodoItems(
    @Args('input') input: UpdateTodoItemsDTO,
  ): Promise<number> {
    return this.service.updateMany(input.query, input.update);
  }

  @Mutation(() => TodoItemDTO)
  async createTodoItem(
    @Args('input') input: CreateTodoItemDTO,
  ): Promise<TodoItemEntity> {
    return this.service.createOne(input);
  }

  @Mutation(() => [TodoItemDTO])
  async createTodoItems(
    @Args('input') input: CreateTodoItemsDTO,
  ): Promise<TodoItemEntity[]> {
    return this.service.createMany(input.todos);
  }

  @Mutation(() => TodoItemDTO)
  async deleteTodoItem(
    @Args('input') input: DeleteTodoItemDTO,
  ): Promise<TodoItemEntity> {
    return this.service.deleteOne({ filter: { id: { eq: input.id } } });
  }

  @Mutation(() => Int)
  async deleteTodoItems(
    @Args('input') input: DeleteTodoItemsDTO,
  ): Promise<number> {
    return this.service.deleteMany(input.query);
  }
}
