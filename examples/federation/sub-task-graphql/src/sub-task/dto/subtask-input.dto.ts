import { Field, InputType, ID } from '@nestjs/graphql';
import { IsOptional, IsString, IsBoolean, IsNotEmpty } from 'class-validator';

@InputType('SubTaskInput')
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
  todoItemId!: number;
}
