import { Injectable } from '@nestjs/common';
import { TypeormQueryService } from '@nestjs-query/query-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TodoItemEntity } from './todo-item.entity';

@Injectable()
export class TodoItemService extends TypeormQueryService<TodoItemEntity> {
  constructor(
    @InjectRepository(TodoItemEntity) repo: Repository<TodoItemEntity>,
  ) {
    super(repo);
  }
}
