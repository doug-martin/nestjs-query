import { GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql'
import { Authorize, FilterableField, FilterableRelation, QueryOptions, Relation } from '@ptc-org/nestjs-query-graphql'

import { TodoItemDTO } from '../../todo-item/dto/todo-item.dto'
import { UserDTO } from '../../user/user.dto'
import { SubTaskAuthorizer } from '../sub-task.authorizer'

@ObjectType('SubTask')
@QueryOptions({ enableTotalCount: true })
@Authorize(SubTaskAuthorizer)
@Relation('owner', () => UserDTO, { disableRemove: true, disableUpdate: true })
@FilterableRelation('todoItem', () => TodoItemDTO, { disableRemove: true })
export class SubTaskDTO {
  @FilterableField(() => ID)
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

  @FilterableField()
  todoItemId!: string

  @FilterableField({ nullable: true })
  createdBy?: string

  @FilterableField({ nullable: true })
  updatedBy?: string

  // dont expose in graphql
  ownerId!: number
}
