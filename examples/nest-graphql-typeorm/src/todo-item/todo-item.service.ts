import { AssemblerQueryService, QueryService } from '@nestjs-query/core';
import { InjectTypeOrmQueryService } from '@nestjs-query/query-typeorm';
import { TodoItemDTO } from './dto/todo-item.dto';
import { TodoItemAssembler } from './todo-item.assembler';
import { TodoItemEntity } from './todo-item.entity';

@QueryService(TodoItemDTO)
export class TodoItemService extends AssemblerQueryService<TodoItemDTO, TodoItemEntity> {
  constructor(
    assembler: TodoItemAssembler,
    @InjectTypeOrmQueryService(TodoItemEntity) queryService: QueryService<TodoItemEntity>,
  ) {
    super(assembler, queryService);
  }
}
