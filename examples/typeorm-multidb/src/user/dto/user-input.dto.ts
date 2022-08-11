import { Field, InputType } from '@nestjs/graphql'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

@InputType('UserInput')
export class UserInputDTO {
  @Field()
  @IsString()
  @IsNotEmpty()
  firstName!: string

  @Field()
  @IsString()
  @IsNotEmpty()
  lastName!: string

  @Field()
  @IsEmail()
  @IsNotEmpty()
  emailAddress!: string
}
