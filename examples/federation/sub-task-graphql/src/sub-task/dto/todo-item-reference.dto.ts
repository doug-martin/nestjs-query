import { Connection } from '@nestjs-query/query-graphql';
import { ObjectType, Directive, Field, ID } from '@nestjs/graphql';
import { SubTaskDTO } from './sub-task.dto';

@ObjectType('TodoItem')
@Directive('@extends')
@Directive('@key(fields: "id")')
@Connection('subTasks', () => SubTaskDTO)
export class TodoItemReferenceDTO {
  @Field(() => ID)
  @Directive('@external')
  id!: number;
}
