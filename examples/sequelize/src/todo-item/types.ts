import { QueryArgsType } from '@codeshine/nestjs-query-graphql';
import { ArgsType } from '@nestjs/graphql';
import { TodoItemDTO } from './dto/todo-item.dto';

@ArgsType()
export class TodoItemQuery extends QueryArgsType(TodoItemDTO) {}

export const TodoItemConnection = TodoItemQuery.ConnectionType;
