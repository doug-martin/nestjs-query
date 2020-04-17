import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Module } from '@nestjs/common';
import { TagTodoItemEntity } from './tag-todo-item.entity';
import { TagEntity } from './tag.entity';
import { TagResolver } from './tag.resolver';
import { TagTodoItemResolver } from './tag-todo-item.resolver';
import { TodoItemResolver } from './todo-item.resolver';

@Module({
  providers: [TagResolver, TagTodoItemResolver, TodoItemResolver],
  imports: [NestjsQueryTypeOrmModule.forFeature([TagEntity, TagTodoItemEntity])],
})
export class TagModule {}
