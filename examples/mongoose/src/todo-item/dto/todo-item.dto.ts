import { FilterableField, KeySet, CursorConnection } from '@nestjs-query/query-graphql';
import { ObjectType, ID, GraphQLISODateTime, Field } from '@nestjs/graphql';
import { AuthGuard } from '../../auth.guard';
import { SubTaskDTO } from '../../sub-task/dto/sub-task.dto';
import { TagDTO } from '../../tag/dto/tag.dto';

@ObjectType('TodoItem')
@KeySet(['id'])
@CursorConnection('subTasks', () => SubTaskDTO, { disableRemove: true, guards: [AuthGuard] })
@CursorConnection('tags', () => TagDTO, { guards: [AuthGuard] })
export class TodoItemDTO {
  @FilterableField(() => ID)
  id!: string;

  @FilterableField()
  title!: string;

  @FilterableField({ nullable: true })
  description?: string;

  @FilterableField()
  completed!: boolean;

  @FilterableField(() => GraphQLISODateTime)
  createdAt!: Date;

  @FilterableField(() => GraphQLISODateTime)
  updatedAt!: Date;

  @Field()
  age!: number;

  @FilterableField()
  priority!: number;

  @FilterableField({ nullable: true })
  createdBy?: string;

  @FilterableField({ nullable: true })
  updatedBy?: string;
}
