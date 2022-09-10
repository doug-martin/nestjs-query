import { GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql'
import { CursorConnection, FilterableField } from '@ptc-org/nestjs-query-graphql'

import { TodoItemDTO } from '../../todo-item/dto/todo-item.dto'

@ObjectType('Tag')
@CursorConnection('todoItems', () => TodoItemDTO)
export class TagDTO {
  @FilterableField(() => ID)
  id!: number

  @FilterableField()
  name!: string

  @FilterableField(() => GraphQLISODateTime)
  created!: Date

  @FilterableField(() => GraphQLISODateTime)
  updated!: Date
}
