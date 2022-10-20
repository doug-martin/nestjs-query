/* eslint-disable no-param-reassign */
import { GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql'
import {
  BeforeCreateMany,
  BeforeCreateOne,
  BeforeUpdateMany,
  BeforeUpdateOne,
  CreateManyInputType,
  CreateOneInputType,
  CursorConnection,
  FilterableField,
  KeySet,
  ObjectId,
  QueryOptions,
  UpdateManyInputType,
  UpdateOneInputType
} from '@ptc-org/nestjs-query-graphql'
import mongoose from 'mongoose'

import { GqlContext } from '../../auth.guard'
import { getUserName } from '../../helpers'
import { TodoItemDTO } from '../../todo-item/dto/todo-item.dto'

@ObjectType('Tag')
@KeySet(['id'])
@QueryOptions({ enableTotalCount: true })
@CursorConnection('todoItems', () => TodoItemDTO, { disableUpdate: true, disableRemove: true })
@BeforeCreateOne((input: CreateOneInputType<TagDTO>, context: GqlContext) => {
  input.input.createdBy = getUserName(context)
  return input
})
@BeforeCreateMany((input: CreateManyInputType<TagDTO>, context: GqlContext) => {
  const createdBy = getUserName(context)
  input.input = input.input.map((c) => ({ ...c, createdBy }))
  return input
})
@BeforeUpdateOne((input: UpdateOneInputType<TagDTO>, context: GqlContext) => {
  input.update.updatedBy = getUserName(context)
  return input
})
@BeforeUpdateMany((input: UpdateManyInputType<TagDTO, TagDTO>, context: GqlContext) => {
  input.update.updatedBy = getUserName(context)
  return input
})
export class TagDTO {
  @ObjectId()
  _id: mongoose.Types.ObjectId

  @FilterableField(() => ID)
  id!: string

  @FilterableField()
  name!: string

  @FilterableField(() => GraphQLISODateTime)
  createdAt!: Date

  @FilterableField(() => GraphQLISODateTime)
  updatedAt!: Date

  @FilterableField({ nullable: true })
  createdBy?: string

  @FilterableField({ nullable: true })
  updatedBy?: string
}
