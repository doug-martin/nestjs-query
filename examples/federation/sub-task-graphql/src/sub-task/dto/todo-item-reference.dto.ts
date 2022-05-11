import { CursorConnection } from '@ptc-org/nestjs-query-graphql';
import { ObjectType, Directive, Field, ID } from '@nestjs/graphql';
import { SubTaskDTO } from './sub-task.dto';

@ObjectType('TodoItem')
@Directive('@extends')
@Directive('@key(fields: "id")')
@CursorConnection('subTasks', () => SubTaskDTO)
export class TodoItemReferenceDTO {
  @Field(() => ID)
  @Directive('@external')
  id!: number;
}
