import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';
import { NestjsQuerySequelizeModule } from '@nestjs-query/query-sequelize';
import { Module } from '@nestjs/common';
import { AuthGuard } from '../auth.guard';
import { TodoItemInputDTO } from './dto/todo-item-input.dto';
import { TodoItemUpdateDTO } from './dto/todo-item-update.dto';
import { TodoItemDTO } from './dto/todo-item.dto';
import { TodoItemEntityTags } from './entity/todo-item-tag.entity';
import { TodoItemAssembler } from './todo-item.assembler';
import { TodoItemEntity } from './entity/todo-item.entity';
import { TodoItemResolver } from './todo-item.resolver';

const guards = [AuthGuard];

@Module({
  providers: [TodoItemResolver],
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQuerySequelizeModule.forFeature([TodoItemEntity, TodoItemEntityTags])],
      assemblers: [TodoItemAssembler],
      resolvers: [
        {
          DTOClass: TodoItemDTO,
          AssemblerClass: TodoItemAssembler,
          CreateDTOClass: TodoItemInputDTO,
          UpdateDTOClass: TodoItemUpdateDTO,
          enableAggregate: true,
          create: { guards },
          update: { guards },
          delete: { guards },
          aggregate: { guards },
        },
      ],
    }),
  ],
})
export class TodoItemModule {}
