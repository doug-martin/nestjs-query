import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Module } from '@nestjs/common';
import { SubTaskEntity } from './sub-task.entity';
import { SubTaskResolver } from './sub-task.resolver';
import { TodoItemResolver } from './todo-item.resolver';

@Module({
  providers: [SubTaskResolver, TodoItemResolver],
  imports: [NestjsQueryTypeOrmModule.forFeature([SubTaskEntity])],
})
export class SubTaskModule {}
