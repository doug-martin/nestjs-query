import { IsString, MaxLength, IsBoolean, IsOptional } from 'class-validator';
import { Field, ID, InputType } from '@nestjs/graphql';

@InputType('TodoItemInput')
export class TodoItemInputDTO {
  @IsString()
  @MaxLength(20)
  @Field()
  title!: string;

  @IsBoolean()
  @Field()
  completed!: boolean;

  @IsOptional()
  @Field(() => ID, { nullable: true })
  assigneeId?: number;
}
