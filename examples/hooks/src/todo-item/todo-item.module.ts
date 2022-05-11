import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AuthGuard } from '../auth/auth.guard';
import { TodoItemInputDTO } from './dto/todo-item-input.dto';
import { TodoItemUpdateDTO } from './dto/todo-item-update.dto';
import { TodoItemDTO } from './dto/todo-item.dto';
import { TodoItemEntity } from './todo-item.entity';
import { TodoItemResolver } from './todo-item.resolver';

const guards = [AuthGuard];
@Module({
  providers: [TodoItemResolver],
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQueryTypeOrmModule.forFeature([TodoItemEntity]), AuthModule],
      resolvers: [
        {
          DTOClass: TodoItemDTO,
          EntityClass: TodoItemEntity,
          CreateDTOClass: TodoItemInputDTO,
          UpdateDTOClass: TodoItemUpdateDTO,
          create: { guards },
          update: { guards },
          delete: { guards },
        },
      ],
    }),
  ],
})
export class TodoItemModule {}
