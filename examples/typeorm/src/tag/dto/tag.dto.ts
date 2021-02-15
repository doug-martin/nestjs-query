/* eslint-disable no-param-reassign */
import {
  FilterableField,
  FilterableCursorConnection,
  BeforeCreateOne,
  CreateOneInputType,
  BeforeCreateMany,
  CreateManyInputType,
  BeforeUpdateOne,
  UpdateOneInputType,
  BeforeUpdateMany,
  UpdateManyInputType,
  KeySet,
} from '@nestjs-query/query-graphql';
import { ObjectType, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { TodoItemDTO } from '../../todo-item/dto/todo-item.dto';
import { GqlContext } from '../../auth.guard';
import { getUserName } from '../../helpers';

@ObjectType('Tag')
@KeySet(['id'])
@FilterableCursorConnection('todoItems', () => TodoItemDTO)
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
  id!: number;

  @FilterableField()
  name!: string;

  @FilterableField(() => GraphQLISODateTime)
  created!: Date;

  @FilterableField(() => GraphQLISODateTime)
  updated!: Date;

  @FilterableField({ nullable: true })
  createdBy?: string;

  @FilterableField({ nullable: true })
  updatedBy?: string;
}
