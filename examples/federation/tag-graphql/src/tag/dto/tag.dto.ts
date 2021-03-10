import { FilterableField, CursorConnection } from '@nestjs-query/query-graphql';
import { ObjectType, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { TagTodoItemDTO } from './tag-todo-item.dto';

@ObjectType('Tag')
@CursorConnection('tagTodoItems', () => TagTodoItemDTO, { disableRemove: true, disableUpdate: true })
export class TagDTO {
  @FilterableField(() => ID)
  id!: number;

  @FilterableField()
  name!: string;

  @FilterableField(() => GraphQLISODateTime)
  created!: Date;

  @FilterableField(() => GraphQLISODateTime)
  updated!: Date;
}
