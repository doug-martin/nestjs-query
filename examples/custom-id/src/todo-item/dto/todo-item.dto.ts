import { GraphQLISODateTime, ObjectType } from '@nestjs/graphql'
import { CursorConnection, FilterableField, IDField } from '@ptc-org/nestjs-query-graphql'

import { CustomIDScalar } from '../../common/custom-id.scalar'
import { SubTaskDTO } from '../../sub-task/dto/sub-task.dto'
import { TagDTO } from '../../tag/dto/tag.dto'

@ObjectType('TodoItem')
@CursorConnection('subTasks', () => SubTaskDTO, { disableRemove: true })
@CursorConnection('tags', () => TagDTO)
export class TodoItemDTO {
  @IDField(() => CustomIDScalar)
  id!: string

  @FilterableField()
  title!: string

  @FilterableField({ nullable: true })
  description?: string

  @FilterableField()
  completed!: boolean

  @FilterableField(() => GraphQLISODateTime, { filterOnly: true })
  created!: Date

  @FilterableField(() => GraphQLISODateTime, { filterOnly: true })
  updated!: Date
}
