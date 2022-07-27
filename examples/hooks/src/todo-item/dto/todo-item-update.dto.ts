import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { BeforeUpdateMany, BeforeUpdateOne } from '@codeshine/nestjs-query-query-graphql';
import { UpdatedByHook } from '../../hooks';

@InputType('TodoItemUpdate')
@BeforeUpdateOne(UpdatedByHook)
@BeforeUpdateMany(UpdatedByHook)
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
