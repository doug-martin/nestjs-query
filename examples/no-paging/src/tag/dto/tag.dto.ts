import { FilterableField, UnPagedRelation } from '@nestjs-query/query-graphql';
import { ObjectType, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { TodoItemDTO } from '../../todo-item/dto/todo-item.dto';

@ObjectType('Tag')
@UnPagedRelation('todoItems', () => TodoItemDTO)
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
