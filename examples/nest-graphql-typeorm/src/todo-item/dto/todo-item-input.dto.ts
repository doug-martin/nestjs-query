import { IsString, MaxLength, IsBoolean } from 'class-validator';
import { Field, InputType } from 'type-graphql';

@InputType('TodoItemInput')
export class TodoItemInputDTO {
  @IsString()
  @MaxLength(20)
  @Field()
  title!: string;

  @IsBoolean()
  @Field()
  completed!: boolean;
}
