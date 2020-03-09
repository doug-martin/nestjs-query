import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Module } from '@nestjs/common';
import { TodoItemAssembler } from './todo-item.assembler';
import { TodoItemEntity } from './todo-item.entity';
import { TodoItemResolver } from './todo-item.resolver';
import { TodoItemService } from './todo-item.service';

@Module({
  providers: [TodoItemResolver, TodoItemService, TodoItemAssembler],
  imports: [NestjsQueryTypeOrmModule.forFeature([TodoItemEntity])],
})
export class TodoItemModule {}
