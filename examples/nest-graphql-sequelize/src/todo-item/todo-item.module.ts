import { NestjsQuerySequelizeModule } from '@nestjs-query/query-sequelize';
import { Module } from '@nestjs/common';
import { TodoItemEntityTags } from './entity/todo-item-tag.entity';
import { TodoItemAssembler } from './todo-item.assembler';
import { TodoItemEntity } from './entity/todo-item.entity';
import { TodoItemResolver } from './todo-item.resolver';
import { TodoItemService } from './todo-item.service';

@Module({
  providers: [TodoItemResolver, TodoItemService, TodoItemAssembler],
  imports: [NestjsQuerySequelizeModule.forFeature([TodoItemEntity, TodoItemEntityTags])],
})
export class TodoItemModule {}
