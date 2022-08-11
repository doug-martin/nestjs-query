import { GraphQLISODateTime, ObjectType } from '@nestjs/graphql'
import { FilterableField, IDField, Relation } from '@ptc-org/nestjs-query-graphql'

import { CustomIDScalar } from '../../common/custom-id.scalar'
import { TodoItemDTO } from '../../todo-item/dto/todo-item.dto'

@ObjectType('SubTask')
@Relation('todoItem', () => TodoItemDTO, { disableRemove: true })
export class SubTaskDTO {
  @IDField(() => CustomIDScalar)
  id!: number

  @FilterableField()
  title!: string

  @FilterableField({ nullable: true })
  description?: string

  @FilterableField()
  completed!: boolean

  @FilterableField(() => GraphQLISODateTime)
  created!: Date

  @FilterableField(() => GraphQLISODateTime)
  updated!: Date

  @FilterableField(() => CustomIDScalar)
  todoItemId!: number
}
