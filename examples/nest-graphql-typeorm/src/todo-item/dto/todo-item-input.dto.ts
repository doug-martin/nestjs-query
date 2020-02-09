import { Field, InputType } from 'type-graphql';

@InputType('TodoItemInput')
export class TodoItemInputDTO {
  @Field()
  title!: string;

  @Field()
  completed!: boolean;
}
