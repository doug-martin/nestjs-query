import { Directive, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql'
import { FilterableField, Reference } from '@ptc-org/nestjs-query-graphql'

import { UserReferenceDTO } from './user-reference.dto'

@ObjectType('TodoItem')
@Directive('@key(fields: "id")')
@Reference('assignee', () => UserReferenceDTO, { id: 'assigneeId' }, { nullable: true })
export class TodoItemDTO {
  @FilterableField(() => ID)
  id!: number

  @FilterableField()
  title!: string

  @FilterableField({ nullable: true })
  description?: string

  @FilterableField()
  completed!: boolean

  @FilterableField({ nullable: true })
  assigneeId?: string

  @FilterableField(() => GraphQLISODateTime)
  created!: Date

  @FilterableField(() => GraphQLISODateTime)
  updated!: Date
}
