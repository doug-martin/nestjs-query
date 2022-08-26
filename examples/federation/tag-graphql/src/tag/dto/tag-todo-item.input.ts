import { Field, InputType } from '@nestjs/graphql'
import { IsInt, IsNotEmpty } from 'class-validator'

@InputType('TagTodoItemInput')
export class TagTodoItemInputDTO {
  @Field()
  @IsInt()
  @IsNotEmpty()
  tagId!: number

  @Field()
  @IsInt()
  @IsNotEmpty()
  todoItemId!: number
}
