import { FilterableField, Authorize, Relation, FilterableCursorConnection } from '@nestjs-query/query-graphql';
import { ObjectType, ID, GraphQLISODateTime, Field } from '@nestjs/graphql';
import { SubTaskDTO } from '../../sub-task/dto/sub-task.dto';
import { TagDTO } from '../../tag/dto/tag.dto';
import { UserDTO } from '../../user/user.dto';
import { UserContext } from '../../auth/auth.interfaces';

@ObjectType('TodoItem')
@Authorize({ authorize: (context: UserContext) => ({ ownerId: { eq: context.req.user.id } }) })
@Relation('owner', () => UserDTO, { disableRemove: true, disableUpdate: true })
@FilterableCursorConnection('subTasks', () => SubTaskDTO, { disableRemove: true })
@FilterableCursorConnection('tags', () => TagDTO)
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

  @FilterableField()
  ownerId!: number;
}
