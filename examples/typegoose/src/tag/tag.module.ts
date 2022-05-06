import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { Module } from '@nestjs/common';
import { NestjsQueryTypegooseModule } from '@ptc-org/nestjs-query-typegoose';
import { TagInputDTO } from './dto/tag-input.dto';
import { TagDTO } from './dto/tag.dto';
import { TagEntity } from './tag.entity';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQueryTypegooseModule.forFeature([TagEntity])],
      resolvers: [
        {
          DTOClass: TagDTO,
          EntityClass: TagEntity,
          CreateDTOClass: TagInputDTO,
          UpdateDTOClass: TagInputDTO,
          enableAggregate: true,
        },
      ],
    }),
  ],
})
export class TagModule {}
