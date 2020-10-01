import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';
import { Module } from '@nestjs/common';
import { NestjsQueryMongooseModule } from '@nestjs-query/query-mongoose';
import { TagInputDTO } from './dto/tag-input.dto';
import { TagDTO } from './dto/tag.dto';
import { TagEntity, TagEntitySchema } from './tag.entity';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryMongooseModule.forFeature([{ document: TagEntity, name: TagEntity.name, schema: TagEntitySchema }]),
      ],
      resolvers: [
        {
          DTOClass: TagDTO,
          EntityClass: TagEntity,
          CreateDTOClass: TagInputDTO,
          UpdateDTOClass: TagInputDTO,
          enableTotalCount: true,
          enableAggregate: true,
        },
      ],
    }),
  ],
})
export class TagModule {}
