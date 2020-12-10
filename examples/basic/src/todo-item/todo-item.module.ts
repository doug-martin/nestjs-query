import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Module } from '@nestjs/common';
import { TodoItemEntity } from './todo-item.entity';
import { TodoItemResolver } from './todo-item.resolver';
import { TodoItemService } from './todo-item.service';

@Module({
  imports: [NestjsQueryTypeOrmModule.forFeature([TodoItemEntity])],
  providers: [TodoItemResolver, TodoItemService],
})
export class TodoItemModule {}
