import { ConnectionType, QueryArgsType } from '@nestjs-query/query-graphql';
import { ArgsType } from 'type-graphql';
import { TodoItemDTO } from './dto/todo-item.dto';

export const TodoItemConnection = ConnectionType(TodoItemDTO);

@ArgsType()
export class TodoItemQuery extends QueryArgsType(TodoItemDTO) {}
