import { FilterableField, FilterableCursorConnection, KeySet, QueryOptions } from '@ptc-org/nestjs-query-graphql';
import { ObjectType, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { TodoItemDTO } from '../../todo-item/dto/todo-item.dto';

@ObjectType('Tag')
@KeySet(['id'])
@QueryOptions({ enableTotalCount: true })
@FilterableCursorConnection('todoItems', () => TodoItemDTO)
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
