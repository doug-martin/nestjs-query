/* eslint-disable no-param-reassign */
import {
  FilterableField,
  BeforeCreateOne,
  CreateOneInputType,
  BeforeCreateMany,
  CreateManyInputType,
  BeforeUpdateOne,
  UpdateOneInputType,
  BeforeUpdateMany,
  UpdateManyInputType,
  KeySet,
  CursorConnection,
} from '@nestjs-query/query-graphql';
import { ObjectType, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { TodoItemDTO } from '../../todo-item/dto/todo-item.dto';
import { GqlContext } from '../../auth.guard';
import { getUserName } from '../../helpers';

@ObjectType('Tag')
@KeySet(['id'])
@CursorConnection('todoItems', () => TodoItemDTO, { disableUpdate: true, disableRemove: true })
@BeforeCreateOne((input: CreateOneInputType<TagDTO>, context: GqlContext) => {
  input.input.createdBy = getUserName(context);
  return input;
})
@BeforeCreateMany((input: CreateManyInputType<TagDTO>, context: GqlContext) => {
  const createdBy = getUserName(context);
  input.input = input.input.map((c) => ({ ...c, createdBy }));
  return input;
})
@BeforeUpdateOne((input: UpdateOneInputType<TagDTO>, context: GqlContext) => {
  input.update.updatedBy = getUserName(context);
  return input;
})
@BeforeUpdateMany((input: UpdateManyInputType<TagDTO, TagDTO>, context: GqlContext) => {
  input.update.updatedBy = getUserName(context);
  return input;
})
export class TagDTO {
  @FilterableField(() => ID)
  id!: string;

  @FilterableField()
  name!: string;

  @FilterableField(() => GraphQLISODateTime)
  createdAt!: Date;

  @FilterableField(() => GraphQLISODateTime)
  updatedAt!: Date;

  @FilterableField({ nullable: true })
  createdBy?: string;

  @FilterableField({ nullable: true })
  updatedBy?: string;
}
