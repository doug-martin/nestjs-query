import { FilterableField, CursorConnection } from "@ptc-org/nestjs-query-graphql";
import { ObjectType, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { TodoItemDTO } from '../../todo-item/dto/todo-item.dto';

@ObjectType('User')
@CursorConnection('todoItems', () => TodoItemDTO)
export class UserDTO {
  @FilterableField(() => ID)
  id!: number;

  @FilterableField()
  firstName!: string;

  @FilterableField()
  lastName!: string;

  @FilterableField()
  emailAddress!: string;

  @FilterableField(() => GraphQLISODateTime)
  created!: Date;

  @FilterableField(() => GraphQLISODateTime)
  updated!: Date;
}
