/* eslint-disable no-param-reassign */
import { GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql'
import {
  BeforeCreateMany,
  BeforeCreateOne,
  BeforeUpdateMany,
  BeforeUpdateOne,
  CreateManyInputType,
  CreateOneInputType,
  FilterableCursorConnection,
  FilterableField,
  KeySet,
  QueryOptions,
  UpdateManyInputType,
  UpdateOneInputType
} from '@ptc-org/nestjs-query-graphql'

import { GqlContext } from '../../auth.guard'
import { getUserName } from '../../helpers'
import { TodoItemDTO } from '../../todo-item/dto/todo-item.dto'

@ObjectType('Tag')
@KeySet(['id'])
@QueryOptions({ enableTotalCount: true })
@FilterableCursorConnection('todoItems', () => TodoItemDTO)
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
