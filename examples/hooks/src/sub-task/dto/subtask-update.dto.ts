import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsBoolean, IsString, IsNotEmpty } from 'class-validator';
import { BeforeUpdateMany, BeforeUpdateOne } from "@ptc-org/nestjs-query-graphql";
import { UpdatedByHook } from '../../hooks';

@InputType('SubTaskUpdate')
@BeforeUpdateOne(UpdatedByHook)
@BeforeUpdateMany(UpdatedByHook)
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
}
