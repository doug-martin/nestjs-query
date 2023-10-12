import {
  FilterableField,
  FilterableCursorConnection,
  KeySet,
  QueryOptions,
  registerDTOFieldComparison,
} from '@nestjs-query/query-graphql';
import { ObjectType, ID, GraphQLISODateTime, Field } from '@nestjs/graphql';
import { AuthGuard } from '../../auth.guard';
import { SubTaskDTO } from '../../sub-task/dto/sub-task.dto';
import { TagDTO } from '../../tag/dto/tag.dto';
import { IsBoolean } from 'class-validator';

@ObjectType('TodoItem')
@KeySet(['id'])
@QueryOptions({ enableTotalCount: true })
@FilterableCursorConnection('subTasks', () => SubTaskDTO, { disableRemove: true, guards: [AuthGuard] })
@FilterableCursorConnection('tags', () => TagDTO, { guards: [AuthGuard] })
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

  @Field()
  age!: number;

  @FilterableField()
  priority!: number;

  @FilterableField({ nullable: true })
  createdBy?: string;

  @FilterableField({ nullable: true })
  updatedBy?: string;
}

// Register the filter at the graphql level
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
registerDTOFieldComparison(TodoItemDTO, 'lowPriority', 'is', {
  FilterType: Boolean,
  GqlType: Boolean,
  decorators: [IsBoolean()],
});
