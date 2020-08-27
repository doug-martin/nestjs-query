import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import {
  BeforeUpdateMany,
  BeforeUpdateOne,
  UpdateManyInputType,
  UpdateOneInputType,
} from '@nestjs-query/query-graphql';
import { TodoItemDTO } from './todo-item.dto';
import { UserContext } from '../../auth/auth.interfaces';

@InputType('TodoItemUpdate')
@BeforeUpdateOne((input: UpdateOneInputType<TodoItemDTO>, context: UserContext) => {
  // eslint-disable-next-line no-param-reassign
  input.update.updatedBy = context.req.user.username;
  return input;
})
@BeforeUpdateMany((input: UpdateManyInputType<TodoItemDTO, TodoItemDTO>, context: UserContext) => {
  // eslint-disable-next-line no-param-reassign
  input.update.updatedBy = context.req.user.username;
  return input;
})
export class TodoItemUpdateDTO {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Field({ nullable: true })
  title?: string;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  completed?: boolean;

  @IsOptional()
  @IsNumber()
  @Field({ nullable: true })
  priority?: number;
}
