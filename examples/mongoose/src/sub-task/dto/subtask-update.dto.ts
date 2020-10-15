import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsBoolean, IsString, IsNotEmpty } from 'class-validator';
import {
  BeforeUpdateMany,
  BeforeUpdateOne,
  UpdateManyInputType,
  UpdateOneInputType,
} from '@nestjs-query/query-graphql';
import { GqlContext } from '../../auth.guard';
import { getUserName } from '../../helpers';
import { SubTaskDTO } from './sub-task.dto';

@InputType('SubTaskUpdate')
@BeforeUpdateOne((input: UpdateOneInputType<SubTaskDTO>, context: GqlContext) => {
  // eslint-disable-next-line no-param-reassign
  input.update.updatedBy = getUserName(context);
  return input;
})
@BeforeUpdateMany((input: UpdateManyInputType<SubTaskDTO, SubTaskDTO>, context: GqlContext) => {
  // eslint-disable-next-line no-param-reassign
  input.update.updatedBy = getUserName(context);
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
  todoItem?: string;
}
