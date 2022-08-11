import { GraphQLISODateTime, ObjectType } from '@nestjs/graphql'
import { CursorConnection, FilterableField, IDField } from '@ptc-org/nestjs-query-graphql'

import { CustomIDScalar } from '../../common/custom-id.scalar'
import { TodoItemDTO } from '../../todo-item/dto/todo-item.dto'

@ObjectType('Tag')
@CursorConnection('todoItems', () => TodoItemDTO)
export class TagDTO {
  @IDField(() => CustomIDScalar)
  id!: number

  @FilterableField()
  name!: string

  @FilterableField(() => GraphQLISODateTime)
  created!: Date

  @FilterableField(() => GraphQLISODateTime)
  updated!: Date
}
