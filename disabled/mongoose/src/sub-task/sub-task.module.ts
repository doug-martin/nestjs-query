import { Module } from '@nestjs/common'
import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql'
import { NestjsQueryMongooseModule } from '@ptc-org/nestjs-query-mongoose'

import { SubTaskDTO } from './dto/sub-task.dto'
import { CreateSubTaskDTO } from './dto/subtask-input.dto'
import { SubTaskUpdateDTO } from './dto/subtask-update.dto'
import { SubTaskEntity, SubTaskEntitySchema } from './sub-task.entity'

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryMongooseModule.forFeature([{ document: SubTaskEntity, name: SubTaskEntity.name, schema: SubTaskEntitySchema }])
      ],
      resolvers: [
        {
          DTOClass: SubTaskDTO,
          EntityClass: SubTaskEntity,
          CreateDTOClass: CreateSubTaskDTO,
          UpdateDTOClass: SubTaskUpdateDTO,
          enableAggregate: true
        }
      ]
    })
  ]
})
export class SubTaskModule {}
