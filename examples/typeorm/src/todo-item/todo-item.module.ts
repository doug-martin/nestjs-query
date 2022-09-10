import { Module } from '@nestjs/common'
import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql'
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm'

import { AuthGuard } from '../auth.guard'
import { TodoItemDTO } from './dto/todo-item.dto'
import { TodoItemInputDTO } from './dto/todo-item-input.dto'
import { TodoItemUpdateDTO } from './dto/todo-item-update.dto'
import { TodoItemAssembler } from './todo-item.assembler'
import { TodoItemEntity } from './todo-item.entity'
import { TodoItemResolver } from './todo-item.resolver'

const guards = [AuthGuard]

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
          enableAggregate: true,
          aggregate: { guards },
          create: { guards },
          update: { guards },
          delete: { guards }
        }
      ]
    })
  ]
})
export class TodoItemModule {}
