import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Module } from '@nestjs/common';
import { SubTaskEntity } from './sub-task.entity';
import { SubTaskResolver } from './sub-task.resolver';
import { TodoItemResolver } from './todo-item.resolver';
import { TodoItemService } from './todo-item.service';

@Module({
  providers: [SubTaskResolver, TodoItemResolver, TodoItemService],
  imports: [NestjsQueryTypeOrmModule.forFeature([SubTaskEntity], 'sub-task-db')],
})
export class SubTaskModule {}
