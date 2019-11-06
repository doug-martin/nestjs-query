import { Field, InputType } from 'type-graphql';

@InputType('CreateTodoItem')
export class CreateTodoItemDTO {
  @Field()
  title: string;

  @Field()
  completed: boolean;
}

@InputType('CreateTodoItems')
export class CreateTodoItemsDTO {
  @Field(() => [CreateTodoItemDTO])
  todos: CreateTodoItemDTO[];
}
