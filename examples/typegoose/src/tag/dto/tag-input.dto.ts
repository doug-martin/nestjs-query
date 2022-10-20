import { Field, InputType } from '@nestjs/graphql'
import { IsNotEmpty, IsString } from 'class-validator'

@InputType('TagInput')
export class TagInputDTO {
  @Field()
  @IsString()
  @IsNotEmpty()
  name!: string
}
