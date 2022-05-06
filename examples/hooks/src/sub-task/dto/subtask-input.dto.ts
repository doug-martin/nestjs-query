import { Field, InputType, ID } from '@nestjs/graphql';
import { IsOptional, IsString, IsBoolean, IsNotEmpty } from 'class-validator';
import { BeforeCreateMany, BeforeCreateOne } from "@ptc-org/nestjs-query-graphql";
import { CreatedByHook } from '../../hooks';

@InputType('SubTaskInput')
@BeforeCreateOne(CreatedByHook)
@BeforeCreateMany(CreatedByHook)
export class CreateSubTaskDTO {
  @Field()
  @IsString()
  @IsNotEmpty()
  title!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @Field()
  @IsBoolean()
  completed!: boolean;

  @Field(() => ID)
  @IsNotEmpty()
  todoItemId!: string;
}
