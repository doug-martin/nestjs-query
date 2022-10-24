import { Module } from '@nestjs/common'
import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql'
import { NestjsQueryMongooseModule } from '@ptc-org/nestjs-query-mongoose'

import { TagDTO } from './dto/tag.dto'
import { TagInputDTO } from './dto/tag-input.dto'
import { TagEntity, TagEntitySchema } from './tag.entity'

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQueryMongooseModule.forFeature([{ document: TagEntity, name: TagEntity.name, schema: TagEntitySchema }])],
      resolvers: [
        {
          DTOClass: TagDTO,
          EntityClass: TagEntity,
          CreateDTOClass: TagInputDTO,
          UpdateDTOClass: TagInputDTO,
          enableAggregate: true
        }
      ]
    })
  ]
})
export class TagModule {}
