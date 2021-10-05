import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('LoginResponse')
export class LoginResponseDto {
  @Field()
  accessToken!: string;
}
