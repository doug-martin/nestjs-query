import { QueryService } from '@nestjs-query/core';
import { CRUDResolver, RepresentationType } from '@nestjs-query/query-graphql';
import { InjectTypeOrmQueryService } from '@nestjs-query/query-typeorm';
import { Resolver, ResolveField } from '@nestjs/graphql';

import { TagTodoItemDTO } from './dto/tag-todo-item.dto';
import { TagTodoItemInputDTO } from './dto/tag-todo-item.input';
import { TagDTO } from './dto/tag.dto';
import { TodoItemDTO } from './dto/todo-item.dto';
import { TagTodoItemEntity } from './tag-todo-item.entity';

@Resolver(() => TagTodoItemDTO)
export class TagTodoItemResolver extends CRUDResolver(TagTodoItemDTO, {
  CreateDTOClass: TagTodoItemInputDTO,
  UpdateDTOClass: TagTodoItemInputDTO,
  relations: {
    one: {
      tag: { DTO: TagDTO },
    },
  },
}) {
  constructor(@InjectTypeOrmQueryService(TagTodoItemEntity) readonly service: QueryService<TagTodoItemEntity>) {
    super(service);
  }

  @ResolveField('todoItem', () => TodoItemDTO)
  getTodoItem(reference: TagTodoItemDTO): RepresentationType {
    return { __typename: 'TodoItem', id: reference.todoItemId };
  }
}
