import { Field, InputType } from 'type-graphql';

@InputType()
export class UpdateTodoItem {
  @Field({ nullable: true })
  title!: string;

  @Field({ nullable: true })
  completed!: boolean;
}
