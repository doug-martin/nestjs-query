import { GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql'
import { FilterableField, KeySet, ObjectId, QueryOptions, Relation } from '@ptc-org/nestjs-query-graphql'
import mongoose from 'mongoose'

import { TodoItemDTO } from '../../todo-item/dto/todo-item.dto'

@ObjectType('SubTask')
@KeySet(['id'])
@QueryOptions({ enableTotalCount: true })
@Relation('todoItem', () => TodoItemDTO, { disableRemove: true })
export class SubTaskDTO {
  @ObjectId()
  _id: mongoose.Types.ObjectId

  @FilterableField(() => ID)
  id!: string

  @FilterableField()
  title!: string

  @FilterableField({ nullable: true })
  description?: string

  @FilterableField()
  completed!: boolean

  @FilterableField(() => GraphQLISODateTime)
  createdAt!: Date

  @FilterableField(() => GraphQLISODateTime)
  updatedAt!: Date

  @FilterableField({ nullable: true })
  createdBy?: string

  @FilterableField({ nullable: true })
  updatedBy?: string
}
