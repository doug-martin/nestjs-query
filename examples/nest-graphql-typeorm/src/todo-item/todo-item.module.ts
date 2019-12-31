import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoItemEntity } from './todo-item.entity';
import { TodoItemResolver } from './todo-item.resolver';
import { TodoItemService } from './todo-item.service';

@Module({
  providers: [TodoItemResolver, TodoItemService],
  imports: [TypeOrmModule.forFeature([TodoItemEntity])],
})
export class TodoItemModule {}
