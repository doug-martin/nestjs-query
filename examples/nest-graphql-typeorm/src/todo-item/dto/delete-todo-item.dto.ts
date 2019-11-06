import { Field, ID, InputType } from 'type-graphql';
import { TodoItemQuery } from './todo-item.dto';

@InputType('DeleteTodoItem')
export class DeleteTodoItemDTO {
  @Field(() => ID)
  id: string;
}

@InputType('DeleteTodoItems')
export class DeleteTodoItemsDTO {
  @Field(() => TodoItemQuery)
  query: TodoItemQuery;
}
