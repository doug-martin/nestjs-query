import { Field, InputType } from '@nestjs/graphql'
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator'

@InputType('UserUpdate')
export class UserUpdateDTO {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Field({ nullable: true })
  name?: string

  @IsOptional()
  @IsEmail()
  @Field({ nullable: true })
  email?: string
}
