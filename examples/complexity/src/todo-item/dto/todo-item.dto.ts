import { FilterableField, CursorConnection } from '@nestjs-query/query-graphql';
import { ObjectType, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { SubTaskDTO } from '../../sub-task/dto/sub-task.dto';
import { TagDTO } from '../../tag/dto/tag.dto';

@ObjectType('TodoItem')
@CursorConnection('subTasks', () => SubTaskDTO, { disableRemove: true, complexity: 5 })
@CursorConnection('tags', () => TagDTO, { complexity: 10 })
export class TodoItemDTO {
  @FilterableField(() => ID, { complexity: 1 })
  id!: number;

  @FilterableField({ complexity: 1 })
  title!: string;

  @FilterableField({ nullable: true, complexity: 1 })
  description?: string;

  @FilterableField({ complexity: 1 })
  completed!: boolean;

  @FilterableField(() => GraphQLISODateTime, { complexity: 1 })
  created!: Date;

  @FilterableField(() => GraphQLISODateTime, { complexity: 1 })
  updated!: Date;
}
