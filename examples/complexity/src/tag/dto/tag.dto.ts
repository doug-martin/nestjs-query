import { FilterableField, CursorConnection } from '@nestjs-query/query-graphql';
import { ObjectType, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { TodoItemDTO } from '../../todo-item/dto/todo-item.dto';

@ObjectType('Tag')
@CursorConnection('todoItems', () => TodoItemDTO, { complexity: 10 })
export class TagDTO {
  @FilterableField(() => ID, { complexity: 1 })
  id!: number;

  @FilterableField({ complexity: 1 })
  name!: string;

  @FilterableField(() => GraphQLISODateTime, { complexity: 1 })
  created!: Date;

  @FilterableField(() => GraphQLISODateTime, { complexity: 1 })
  updated!: Date;
}
