import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsBoolean, IsString, IsNotEmpty } from 'class-validator';
import {
  BeforeUpdateMany,
  BeforeUpdateOne,
  UpdateManyInputType,
  UpdateOneInputType,
} from "@ptc-org/nestjs-query-graphql";
import { SubTaskDTO } from './sub-task.dto';
import { UserContext } from '../../auth/auth.interfaces';

@InputType('SubTaskUpdate')
@BeforeUpdateOne((input: UpdateOneInputType<SubTaskUpdateDTO>, context: UserContext) => {
  // eslint-disable-next-line no-param-reassign
  input.update.updatedBy = context.req.user.username;
  return input;
})
@BeforeUpdateMany((input: UpdateManyInputType<SubTaskDTO, SubTaskUpdateDTO>, context: UserContext) => {
  // eslint-disable-next-line no-param-reassign
  input.update.updatedBy = context.req.user.username;
  return input;
})
export class SubTaskUpdateDTO {
  @Field()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsNotEmpty()
  todoItemId?: string;

  // dont expose these fields in the graphql schema
  updatedBy!: string;
}
