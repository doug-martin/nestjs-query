import { IsString, MaxLength, IsBoolean } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';
import {
  BeforeCreateMany,
  BeforeCreateOne,
  CreateManyInputType,
  CreateOneInputType,
} from '@codeshine/nestjs-query-graphql';
import { UserContext } from '../../auth/auth.interfaces';

@InputType('TodoItemInput')
@BeforeCreateOne((input: CreateOneInputType<TodoItemInputDTO>, context: UserContext) => {
  const { user } = context.req;
  // eslint-disable-next-line no-param-reassign
  return { input: { ...input.input, createdBy: user.username, ownerId: user.id } };
})
@BeforeCreateMany((input: CreateManyInputType<TodoItemInputDTO>, context: UserContext) => {
  const createdBy = context.req.user.username;
  const ownerId = context.req.user.id;
  // eslint-disable-next-line no-param-reassign
  input.input = input.input.map((c) => ({ ...c, createdBy, ownerId }));
  return input;
})
export class TodoItemInputDTO {
  @IsString()
  @MaxLength(20)
  @Field()
  title!: string;

  @IsBoolean()
  @Field()
  completed!: boolean;

  // dont expose these fields in graphql
  createdBy!: string;

  ownerId!: number;
}
