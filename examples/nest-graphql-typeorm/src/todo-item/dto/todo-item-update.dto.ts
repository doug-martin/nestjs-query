import { IsString, MaxLength, IsBoolean, IsOptional } from 'class-validator';
import { Field, InputType } from 'type-graphql';

@InputType('TodoItemUpdate')
export class TodoItemUpdateDTO {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Field({ nullable: true })
  title?: string;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  completed?: boolean;
}
