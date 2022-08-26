import { Directive, Field, ID, ObjectType } from '@nestjs/graphql'
import { CursorConnection } from '@ptc-org/nestjs-query-graphql'

import { TagTodoItemDTO } from './tag-todo-item.dto'

@ObjectType('TodoItem')
@Directive('@extends')
@Directive('@key(fields: "id")')
@CursorConnection('tagTodoItems', () => TagTodoItemDTO)
export class TodoItemReferenceDTO {
  @Field(() => ID)
  @Directive('@external')
  id!: number
}
