import { QueryService } from '@nestjs-query/core';
import { CRUDResolver } from '@nestjs-query/query-graphql';
import { InjectTypeOrmQueryService } from '@nestjs-query/query-typeorm';
import { Resolver, ResolveReference } from '@nestjs/graphql';
import { TodoItemInputDTO } from './dto/todo-item-input.dto';
import { TodoItemUpdateDTO } from './dto/todo-item-update.dto';
import { TodoItemDTO } from './dto/todo-item.dto';
import { TodoItemEntity } from './todo-item.entity';

@Resolver(() => TodoItemDTO)
export class TodoItemResolver extends CRUDResolver(TodoItemDTO, {
  CreateDTOClass: TodoItemInputDTO,
  UpdateDTOClass: TodoItemUpdateDTO,
}) {
  constructor(@InjectTypeOrmQueryService(TodoItemEntity) readonly service: QueryService<TodoItemEntity>) {
    super(service);
  }

  @ResolveReference()
  resolveReference(reference: { __typename: string; id: string }): Promise<TodoItemDTO> {
    return this.service.getById(reference.id);
  }
}
