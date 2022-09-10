import { Field, InputType } from '@nestjs/graphql'
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator'

@InputType('SubTaskUpdate')
export class SubTaskUpdateDTO {
  @Field()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  title?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  description?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  completed?: boolean

  @Field({ nullable: true })
  @IsOptional()
  @IsNotEmpty()
  todoItemId?: string
}
