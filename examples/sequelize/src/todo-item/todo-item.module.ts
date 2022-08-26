import { Module } from '@nestjs/common'
import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql'
import { NestjsQuerySequelizeModule } from '@ptc-org/nestjs-query-sequelize'

import { AuthGuard } from '../auth.guard'
import { TodoItemDTO } from './dto/todo-item.dto'
import { TodoItemInputDTO } from './dto/todo-item-input.dto'
import { TodoItemUpdateDTO } from './dto/todo-item-update.dto'
import { TodoItemEntity } from './entity/todo-item.entity'
import { TodoItemEntityTags } from './entity/todo-item-tag.entity'
import { TodoItemAssembler } from './todo-item.assembler'
import { TodoItemResolver } from './todo-item.resolver'

const guards = [AuthGuard]

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
          aggregate: { guards }
        }
      ]
    })
  ]
})
export class TodoItemModule {}
