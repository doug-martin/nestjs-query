import { AssemblerQueryService, QueryService } from '@nestjs-query/core';
import { InjectSequelizeQueryService } from '@nestjs-query/query-sequelize';
import { TodoItemDTO } from './dto/todo-item.dto';
import { TodoItemAssembler } from './todo-item.assembler';
import { TodoItemEntity } from './entity/todo-item.entity';

@QueryService(TodoItemDTO)
export class TodoItemService extends AssemblerQueryService<TodoItemDTO, TodoItemEntity> {
  constructor(
    assembler: TodoItemAssembler,
    @InjectSequelizeQueryService(TodoItemEntity) queryService: QueryService<TodoItemEntity>,
  ) {
    super(assembler, queryService);
  }
}
