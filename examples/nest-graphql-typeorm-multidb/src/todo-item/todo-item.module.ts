import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Module } from '@nestjs/common';
import { TodoItemEntity } from './todo-item.entity';
import { TodoItemResolver } from './todo-item.resolver';

@Module({
  providers: [TodoItemResolver],
  imports: [NestjsQueryTypeOrmModule.forFeature([TodoItemEntity])],
})
export class TodoItemModule {}
