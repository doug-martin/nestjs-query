import { Field, ID, InputType } from '@nestjs/graphql'

@InputType()
export class TestResolverInputDTO {
  @Field(() => ID)
  id!: string

  @Field()
  stringField!: string
}
