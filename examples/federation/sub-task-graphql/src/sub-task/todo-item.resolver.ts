import { QueryService } from '@nestjs-query/core';
import { InjectTypeOrmQueryService } from '@nestjs-query/query-typeorm';
import { Resolver, ResolveField } from '@nestjs/graphql';
import { TodoItemDTO } from './dto/todo-item.dto';
import { SubTaskEntity } from './sub-task.entity';
import { SubTaskDTO } from './dto/sub-task.dto';

@Resolver(() => TodoItemDTO)
export class TodoItemResolver {
  constructor(@InjectTypeOrmQueryService(SubTaskEntity) readonly service: QueryService<SubTaskEntity>) {}

  @ResolveField('subTasks', () => [SubTaskDTO])
  getSubTasks(reference: TodoItemDTO): Promise<SubTaskDTO[]> {
    return this.service.query({ filter: { todoItemId: { eq: reference.id } } });
  }
}
