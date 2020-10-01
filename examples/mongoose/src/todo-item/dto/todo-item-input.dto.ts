import { IsString, MaxLength, IsBoolean } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';
import {
  BeforeCreateMany,
  BeforeCreateOne,
  CreateManyInputType,
  CreateOneInputType,
} from '@nestjs-query/query-graphql';
import { GqlContext } from '../../auth.guard';
import { getUserName } from '../../helpers';
import { TodoItemDTO } from './todo-item.dto';

@InputType('TodoItemInput')
@BeforeCreateOne((input: CreateOneInputType<TodoItemDTO>, context: GqlContext) => {
  // eslint-disable-next-line no-param-reassign
  input.input.createdBy = getUserName(context);
  return input;
})
@BeforeCreateMany((input: CreateManyInputType<TodoItemDTO>, context: GqlContext) => {
  const createdBy = getUserName(context);
  // eslint-disable-next-line no-param-reassign
  input.input = input.input.map((c) => ({ ...c, createdBy }));
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
}
