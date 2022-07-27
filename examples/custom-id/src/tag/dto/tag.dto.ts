import { FilterableField, CursorConnection, IDField } from '@codeshine/nestjs-query-graphql';
import { ObjectType, GraphQLISODateTime } from '@nestjs/graphql';
import { TodoItemDTO } from '../../todo-item/dto/todo-item.dto';
import { CustomIDScalar } from '../../common/custom-id.scalar';

@ObjectType('Tag')
@CursorConnection('todoItems', () => TodoItemDTO)
export class TagDTO {
  @IDField(() => CustomIDScalar)
  id!: number;

  @FilterableField()
  name!: string;

  @FilterableField(() => GraphQLISODateTime)
  created!: Date;

  @FilterableField(() => GraphQLISODateTime)
  updated!: Date;
}
