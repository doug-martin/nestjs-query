import { IsString, MaxLength, IsBoolean, IsOptional } from 'class-validator';
import { Field, ID, InputType } from '@nestjs/graphql';

@InputType('TodoItemUpdate')
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
  @Field(() => ID, { nullable: true })
  assigneeId?: number;
}
