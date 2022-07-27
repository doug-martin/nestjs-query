import { FilterableField, CursorConnection } from '@codeshine/nestjs-query-graphql';
import { ObjectType, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { SubTaskDTO } from '../../sub-task/dto/sub-task.dto';
import { TagDTO } from '../../tag/dto/tag.dto';

@ObjectType('TodoItem')
@CursorConnection('subTasks', () => SubTaskDTO, { disableRemove: true })
@CursorConnection('tags', () => TagDTO)
export class TodoItemDTO {
  @FilterableField(() => ID)
  id!: number;

  @FilterableField()
  title!: string;

  @FilterableField({ nullable: true })
  description?: string;

  @FilterableField()
  completed!: boolean;

  @FilterableField(() => GraphQLISODateTime, { filterOnly: true })
  created!: Date;

  @FilterableField(() => GraphQLISODateTime, { filterOnly: true })
  updated!: Date;
}
