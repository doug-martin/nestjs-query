import { Field, InputType } from 'type-graphql';
import { IsString, Length } from 'class-validator';

@InputType('TodoItemChecklistInput')
export class TodoItemChecklistDTO {
  @Field()
  @IsString()
  @Length(10)
  name!: string;
}
@InputType('TodoItemInput')
export class TodoItemInputDTO {
  @Field()
  title!: string;

  @Field()
  completed!: boolean;

  @Field(() => [TodoItemChecklistDTO], { nullable: true })
  checklist?: TodoItemChecklistDTO[];
}
