import { ArgsType } from '@nestjs/graphql'
import { QueryArgsType } from '@ptc-org/nestjs-query-graphql'

import { TodoItemDTO } from './dto/todo-item.dto'

@ArgsType()
export class TodoItemQuery extends QueryArgsType(TodoItemDTO) {}

export const TodoItemConnection = TodoItemQuery.ConnectionType
