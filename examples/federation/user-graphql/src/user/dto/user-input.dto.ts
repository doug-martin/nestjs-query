import { IsEmail, IsString, MaxLength } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

@InputType('UserInput')
export class UserInputDTO {
  @IsString()
  @MaxLength(50)
  @Field()
  name!: string;

  @IsEmail()
  @Field()
  email!: string;
}
