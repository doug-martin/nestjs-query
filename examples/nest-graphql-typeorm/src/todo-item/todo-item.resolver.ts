import {
  GraphQLConnectionType,
  GraphQLQueryResolver,
  GraphQLQueryType,
} from '@nestjs-query/query-graphql';
import { Resolver, Query, Args } from '@nestjs/graphql';
import { CreateTodoItem } from './dto/create-todo-item.dto';
import { TodoItemDTO } from './dto/todo-item.dto';
import { UpdateTodoItem } from './dto/update-todo-item.dto';
import { TodoItemService } from './todo-item.service';
import { AuthGuard } from '../auth.guard';

@Resolver()
export class TodoItemResolver extends GraphQLQueryResolver(TodoItemDTO, {
  typeName: 'TodoItem',
  CreateType: () => CreateTodoItem,
  UpdateType: () => UpdateTodoItem,
  methods: {
    mutations: { guards: [AuthGuard] },
  },
}) {
  constructor(readonly service: TodoItemService) {
    super(service);
  }

  @Query(() => TodoItemResolver.ConnectionType)
  completedTodos(
    @Args({ type: () => TodoItemResolver.QueryType })
    query: GraphQLQueryType<TodoItemDTO>,
  ): Promise<GraphQLConnectionType<TodoItemDTO>> {
    const filter = { ...query.filter, ...{ completed: { is: true } } };
    return this.query({ ...query, ...{ filter } });
  }

  @Query(() => TodoItemResolver.ConnectionType)
  uncompletedTodos(
    @Args({ type: () => TodoItemResolver.QueryType })
    query: GraphQLQueryType<TodoItemDTO>,
  ): Promise<GraphQLConnectionType<TodoItemDTO>> {
    const filter = { ...query.filter, ...{ completed: { is: false } } };
    return this.query({ ...query, ...{ filter } });
  }
}
