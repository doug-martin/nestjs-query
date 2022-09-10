import { Module } from '@nestjs/common'
import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql'
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm'

import { TodoItemDTO } from './dto/todo-item.dto'
import { TodoItemInputDTO } from './dto/todo-item-input.dto'
import { TodoItemUpdateDTO } from './dto/todo-item-update.dto'
import { TodoItemEntity } from './todo-item.entity'

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQueryTypeOrmModule.forFeature([TodoItemEntity])],
      resolvers: [
        {
          DTOClass: TodoItemDTO,
          EntityClass: TodoItemEntity,
          CreateDTOClass: TodoItemInputDTO,
          UpdateDTOClass: TodoItemUpdateDTO,
          referenceBy: { key: 'id' }
        }
      ]
    })
  ]
})
export class TodoItemModule {}
