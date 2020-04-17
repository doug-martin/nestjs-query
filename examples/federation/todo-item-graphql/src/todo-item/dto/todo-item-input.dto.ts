import { IsString, MaxLength, IsBoolean } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

@InputType('TodoItemInput')
export class TodoItemInputDTO {
  @IsString()
  @MaxLength(50)
  @Field()
  title!: string;

  @IsBoolean()
  @Field()
  completed!: boolean;
}
