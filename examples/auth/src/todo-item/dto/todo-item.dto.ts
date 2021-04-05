import {
  FilterableField,
  Authorize,
  Relation,
  FilterableCursorConnection,
  QueryOptions,
  AuthorizationContext,
} from '@nestjs-query/query-graphql';
import { ObjectType, ID, GraphQLISODateTime, Field } from '@nestjs/graphql';
import { SubTaskDTO } from '../../sub-task/dto/sub-task.dto';
import { TagDTO } from '../../tag/dto/tag.dto';
import { UserDTO } from '../../user/user.dto';
import { UserContext } from '../../auth/auth.interfaces';

@ObjectType('TodoItem')
@QueryOptions({ enableTotalCount: true })
@Authorize({
  authorize: (context: UserContext, authorizationContext?: AuthorizationContext) => {
    if (
      context.req.user.username === 'nestjs-query-3' &&
      (authorizationContext?.operationGroup === 'read' || authorizationContext?.operationGroup === 'aggregate')
    ) {
      return {};
    }
    return { ownerId: { eq: context.req.user.id } };
  },
})
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
