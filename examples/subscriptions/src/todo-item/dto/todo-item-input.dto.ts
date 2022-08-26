import { Field, InputType } from '@nestjs/graphql'
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
  @IsString()
  @Field({ nullable: true })
  description?: string
}
