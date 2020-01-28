import { Field, InputType } from 'type-graphql';
import { IsString, Length } from 'class-validator';

@InputType('TodoItemInput')
export class TodoItemInputDTO {
  @Field()
  // ensure it is a string field
  @IsString()
  // min length of 5 and max of 5 characters
  @Length(5, 50)
  title!: string;

  @Field()
  completed!: boolean;
}
