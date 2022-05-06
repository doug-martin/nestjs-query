import { CursorConnection } from "@ptc-org/nestjs-query-graphql";
import { ObjectType, Directive, Field, ID } from '@nestjs/graphql';
import { TagTodoItemDTO } from './tag-todo-item.dto';

@ObjectType('TodoItem')
@Directive('@extends')
@Directive('@key(fields: "id")')
@CursorConnection('tagTodoItems', () => TagTodoItemDTO)
export class TodoItemReferenceDTO {
  @Field(() => ID)
  @Directive('@external')
  id!: number;
}
