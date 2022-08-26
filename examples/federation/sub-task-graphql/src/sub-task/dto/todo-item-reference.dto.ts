import { Directive, Field, ID, ObjectType } from '@nestjs/graphql'
import { CursorConnection } from '@ptc-org/nestjs-query-graphql'

import { SubTaskDTO } from './sub-task.dto'

@ObjectType('TodoItem')
@Directive('@extends')
@Directive('@key(fields: "id")')
@CursorConnection('subTasks', () => SubTaskDTO)
export class TodoItemReferenceDTO {
  @Field(() => ID)
  @Directive('@external')
  id!: number
}
