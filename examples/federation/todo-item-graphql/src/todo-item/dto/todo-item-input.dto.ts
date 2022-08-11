import { Field, ID, InputType } from '@nestjs/graphql'
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator'

@InputType('TodoItemInput')
export class TodoItemInputDTO {
  @IsString()
  @MaxLength(20)
  @Field()
  title!: string

  @IsBoolean()
  @Field()
  completed!: boolean

  @IsOptional()
  @Field(() => ID, { nullable: true })
  assigneeId?: number
}
