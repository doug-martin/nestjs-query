import { IsString, MaxLength, IsBoolean } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

@InputType('TodoItemInput')
export class TodoItemInputDTO {
  @IsString()
  @MaxLength(20)
  @Field()
  name!: string;

  @IsBoolean()
  @Field()
  isCompleted!: boolean;
}
