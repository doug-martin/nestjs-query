import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';
import { Module } from '@nestjs/common';
import { NestjsQueryMongooseModule } from '@nestjs-query/query-mongoose';
import { AuthGuard } from '../auth.guard';
import { TodoItemInputDTO } from './dto/todo-item-input.dto';
import { TodoItemUpdateDTO } from './dto/todo-item-update.dto';
import { TodoItemDTO } from './dto/todo-item.dto';
import { TodoItemAssembler } from './todo-item.assembler';
import { TodoItemEntity, TodoItemEntitySchema } from './todo-item.entity';
import { TodoItemResolver } from './todo-item.resolver';

const guards = [AuthGuard];
@Module({
  providers: [TodoItemResolver],
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryMongooseModule.forFeature([
          { document: TodoItemEntity, name: TodoItemEntity.name, schema: TodoItemEntitySchema },
        ]),
      ],
      assemblers: [TodoItemAssembler],
      resolvers: [
        {
          DTOClass: TodoItemDTO,
          AssemblerClass: TodoItemAssembler,
          CreateDTOClass: TodoItemInputDTO,
          UpdateDTOClass: TodoItemUpdateDTO,
          enableTotalCount: true,
          enableAggregate: true,
          aggregate: { guards },
          create: { guards },
          update: { guards },
          delete: { guards },
        },
      ],
    }),
  ],
})
export class TodoItemModule {}
