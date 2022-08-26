import { GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql'
import { CursorConnection, FilterableField } from '@ptc-org/nestjs-query-graphql'

import { TagTodoItemDTO } from './tag-todo-item.dto'

@ObjectType('Tag')
@CursorConnection('tagTodoItems', () => TagTodoItemDTO, { disableRemove: true, disableUpdate: true })
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
