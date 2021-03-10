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
  FilterableCursorConnection,
} from '@nestjs-query/query-graphql';
import { ObjectType, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { TodoItemDTO } from '../../todo-item/dto/todo-item.dto';
import { UserContext } from '../../auth/auth.interfaces';

@ObjectType('Tag')
@FilterableCursorConnection('todoItems', () => TodoItemDTO)
@BeforeCreateOne((input: CreateOneInputType<TagDTO>, context: UserContext) => {
  input.input.createdBy = context.req.user.username;
  return input;
})
@BeforeCreateMany((input: CreateManyInputType<TagDTO>, context: UserContext) => {
  const createdBy = context.req.user.username;
  input.input = input.input.map((c) => ({ ...c, createdBy }));
  return input;
})
@BeforeUpdateOne((input: UpdateOneInputType<TagDTO>, context: UserContext) => {
  input.update.updatedBy = context.req.user.username;
  return input;
})
@BeforeUpdateMany((input: UpdateManyInputType<TagDTO, TagDTO>, context: UserContext) => {
  input.update.updatedBy = context.req.user.username;
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
