import { ConnectionType, QueryArgsType } from '@nestjs-query/query-graphql';
import { ArgsType } from '@nestjs/graphql';
import { TodoItemDTO } from './dto/todo-item.dto';

export const TodoItemConnection = ConnectionType(TodoItemDTO, { enableTotalCount: true });

@ArgsType()
export class TodoItemQuery extends QueryArgsType(TodoItemDTO, { defaultResultSize: 2 }) {}
