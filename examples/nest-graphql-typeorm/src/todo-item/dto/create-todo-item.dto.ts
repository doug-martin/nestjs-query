import { Field, InputType } from 'type-graphql';

@InputType()
export class CreateTodoItem {
  @Field()
  title: string;

  @Field()
  completed: boolean;
}
