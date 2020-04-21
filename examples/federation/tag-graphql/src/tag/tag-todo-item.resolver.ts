import { QueryService } from '@nestjs-query/core';
import { CRUDResolver } from '@nestjs-query/query-graphql';
import { InjectTypeOrmQueryService } from '@nestjs-query/query-typeorm';
import { Resolver } from '@nestjs/graphql';
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
  references: {
    todoItem: { DTO: TodoItemDTO, keys: { id: 'todoItemId' } },
  },
}) {
  constructor(@InjectTypeOrmQueryService(TagTodoItemEntity) readonly service: QueryService<TagTodoItemEntity>) {
    super(service);
  }
}
