import { ObjectType, Directive, Field, ID } from '@nestjs/graphql';

@ObjectType('User')
@Directive('@extends')
@Directive('@key(fields: "id")')
export class UserReferenceDTO {
  @Field(() => ID)
  @Directive('@external')
  id!: number;
}
