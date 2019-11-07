import { Field, ID, InputType } from 'type-graphql';
import { TodoItemQuery } from './todo-item.dto';

@InputType()
class UpdateTodoItem {
  @Field({ nullable: true })
  title: string;

  @Field({ nullable: true })
  completed: boolean;
}

@InputType('UpdateTodoItemInput')
export class UpdateTodoItemDTO {
  @Field(() => ID)
  id: string;

  @Field(() => UpdateTodoItem)
  update: UpdateTodoItem;
}

@InputType('UpdateTodoItemsInput')
export class UpdateTodoItemsDTO {
  @Field(() => TodoItemQuery)
  query: TodoItemQuery;

  @Field(() => UpdateTodoItem)
  update: UpdateTodoItem;
}
