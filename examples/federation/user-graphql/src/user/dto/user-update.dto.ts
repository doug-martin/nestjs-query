import { IsString, MaxLength, IsOptional, IsEmail } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

@InputType('UserUpdate')
export class UserUpdateDTO {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Field({ nullable: true })
  name?: string;

  @IsOptional()
  @IsEmail()
  @Field({ nullable: true })
  email?: string;
}
