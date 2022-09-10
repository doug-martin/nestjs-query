/* eslint-disable no-param-reassign */
import { GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql'
import {
  BeforeCreateMany,
  BeforeCreateOne,
  BeforeUpdateMany,
  BeforeUpdateOne,
  FilterableCursorConnection,
  FilterableField,
  KeySet
} from '@ptc-org/nestjs-query-graphql'

import { CreatedByHook, UpdatedByHook } from '../../hooks'
import { TodoItemDTO } from '../../todo-item/dto/todo-item.dto'

@ObjectType('Tag')
@KeySet(['id'])
@FilterableCursorConnection('todoItems', () => TodoItemDTO)
@BeforeCreateOne(CreatedByHook)
@BeforeCreateMany(CreatedByHook)
@BeforeUpdateOne(UpdatedByHook)
@BeforeUpdateMany(UpdatedByHook)
export class TagDTO {
  @FilterableField(() => ID)
  id!: number

  @FilterableField()
  name!: string

  @FilterableField(() => GraphQLISODateTime)
  created!: Date

  @FilterableField(() => GraphQLISODateTime)
  updated!: Date

  @FilterableField({ nullable: true })
  createdBy?: string

  @FilterableField({ nullable: true })
  updatedBy?: string
}
