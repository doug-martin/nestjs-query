import { InjectQueryService, QueryService } from '@nestjs-query/core';
import { CRUDResolver } from '@nestjs-query/query-graphql';
import { Resolver } from '@nestjs/graphql';
import { TagTodoItemDTO } from './dto/tag-todo-item.dto';
import { TagTodoItemInputDTO } from './dto/tag-todo-item.input';
import { TodoItemReferenceDTO } from './dto/todo-item-reference.dto';
import { TagTodoItemEntity } from './tag-todo-item.entity';

@Resolver(() => TagTodoItemDTO)
export class TagTodoItemResolver extends CRUDResolver(TagTodoItemDTO, {
  CreateDTOClass: TagTodoItemInputDTO,
  UpdateDTOClass: TagTodoItemInputDTO,
  references: {
    todoItem: { DTO: TodoItemReferenceDTO, keys: { id: 'todoItemId' } },
  },
}) {
  constructor(@InjectQueryService(TagTodoItemEntity) readonly service: QueryService<TagTodoItemEntity>) {
    super(service);
  }
}
