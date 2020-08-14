import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('User')
export class UserDTO {
  @Field()
  username!: string;

  @Field()
  created!: Date;

  @Field()
  updated!: Date;
}
