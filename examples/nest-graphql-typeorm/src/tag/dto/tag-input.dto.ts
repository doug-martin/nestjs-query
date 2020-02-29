import { Field, InputType } from 'type-graphql';
import { IsString, IsNotEmpty } from 'class-validator';

@InputType('TagInput')
export class TagInputDTO {
  @Field()
  @IsString()
  @IsNotEmpty()
  name!: string;
}
