import { QueryService } from '@nestjs-query/core';
import { TypeOrmQueryService } from '@nestjs-query/query-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TodoItemDTO } from './dto/todo-item.dto';
import { TodoItemEntity } from './todo-item.entity';

@QueryService(TodoItemDTO)
export class TodoItemService extends TypeOrmQueryService<TodoItemDTO, TodoItemEntity> {
  constructor(@InjectRepository(TodoItemEntity) readonly repo: Repository<TodoItemEntity>) {
    super(repo);
  }
}
