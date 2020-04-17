import { QueryService } from '@nestjs-query/core';
import { InjectTypeOrmQueryService } from '@nestjs-query/query-typeorm';
import { Resolver, ResolveField } from '@nestjs/graphql';
import { TagTodoItemDTO } from './dto/tag-todo-item.dto';
import { TodoItemDTO } from './dto/todo-item.dto';
import { TagTodoItemEntity } from './tag-todo-item.entity';

@Resolver(() => TodoItemDTO)
export class TodoItemResolver {
  constructor(@InjectTypeOrmQueryService(TagTodoItemEntity) readonly service: QueryService<TagTodoItemEntity>) {}

  @ResolveField('tagTodoItems', () => [TagTodoItemDTO])
  getTagTodoItems(reference: TodoItemDTO): Promise<TagTodoItemDTO[]> {
    return this.service.query({ filter: { todoItemId: { eq: reference.id } } });
  }
}
