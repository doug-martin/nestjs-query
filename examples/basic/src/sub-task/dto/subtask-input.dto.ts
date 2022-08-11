import { Field, ID, InputType } from '@nestjs/graphql'
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator'

@InputType('SubTaskInput')
export class CreateSubTaskDTO {
  @Field()
  @IsString()
  @IsNotEmpty()
  title!: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string

  @Field()
  @IsBoolean()
  completed!: boolean

  @Field(() => ID)
  @IsNotEmpty()
  todoItemId!: string
}
