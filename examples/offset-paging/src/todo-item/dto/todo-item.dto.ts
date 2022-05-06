import { FilterableField, OffsetConnection, PagingStrategies, QueryOptions } from "@ptc-org/nestjs-query-graphql";
import { ObjectType, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { SubTaskDTO } from '../../sub-task/dto/sub-task.dto';
import { TagDTO } from '../../tag/dto/tag.dto';

@ObjectType('TodoItem')
@QueryOptions({ pagingStrategy: PagingStrategies.OFFSET, enableTotalCount: true })
@OffsetConnection('subTasks', () => SubTaskDTO, { disableRemove: true })
@OffsetConnection('tags', () => TagDTO)
export class TodoItemDTO {
  @FilterableField(() => ID)
  id!: number;

  @FilterableField()
  title!: string;

  @FilterableField({ nullable: true })
  description?: string;

  @FilterableField()
  completed!: boolean;

  @FilterableField(() => GraphQLISODateTime)
  created!: Date;

  @FilterableField(() => GraphQLISODateTime)
  updated!: Date;
}
