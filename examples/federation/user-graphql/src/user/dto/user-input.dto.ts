import { Field, InputType } from '@nestjs/graphql'
import { IsEmail, IsString, MaxLength } from 'class-validator'

@InputType('UserInput')
export class UserInputDTO {
  @IsString()
  @MaxLength(50)
  @Field()
  name!: string

  @IsEmail()
  @Field()
  email!: string
}
