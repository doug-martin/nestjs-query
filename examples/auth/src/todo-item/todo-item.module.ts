import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Module } from '@nestjs/common';
import { TodoItemInputDTO } from './dto/todo-item-input.dto';
import { TodoItemUpdateDTO } from './dto/todo-item-update.dto';
import { TodoItemDTO } from './dto/todo-item.dto';
import { TodoItemAssembler } from './todo-item.assembler';
import { TodoItemEntity } from './todo-item.entity';
import { TodoItemResolver } from './todo-item.resolver';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Module({
  providers: [TodoItemResolver],
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQueryTypeOrmModule.forFeature([TodoItemEntity])],
      assemblers: [TodoItemAssembler],
      resolvers: [
        {
          DTOClass: TodoItemDTO,
          AssemblerClass: TodoItemAssembler,
          CreateDTOClass: TodoItemInputDTO,
          UpdateDTOClass: TodoItemUpdateDTO,
          enableTotalCount: true,
          enableAggregate: true,
          guards: [JwtAuthGuard],
        },
      ],
    }),
  ],
})
export class TodoItemModule {}
