import { Module } from '@nestjs/common'
import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql'
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm'

import { SubTaskDTO } from './dto/sub-task.dto'
import { CreateSubTaskDTO } from './dto/subtask-input.dto'
import { SubTaskUpdateDTO } from './dto/subtask-update.dto'
import { TodoItemReferenceDTO } from './dto/todo-item-reference.dto'
import { SubTaskEntity } from './sub-task.entity'
import { TodoItemService } from './todo-item.service'

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQueryTypeOrmModule.forFeature([SubTaskEntity])],
      services: [TodoItemService],
      resolvers: [
        {
          DTOClass: SubTaskDTO,
          EntityClass: SubTaskEntity,
          CreateDTOClass: CreateSubTaskDTO,
          UpdateDTOClass: SubTaskUpdateDTO
        },
        {
          type: 'federated',
          DTOClass: TodoItemReferenceDTO,
          Service: TodoItemService
        }
      ]
    })
  ]
})
export class SubTaskModule {}
