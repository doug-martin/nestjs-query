import { NestjsQueryGraphQLModule } from '@codeshine/nestjs-query-graphql';
import { NestjsQuerySequelizeModule } from '@codeshine/nestjs-query-sequelize';
import { Module } from '@nestjs/common';
import { TagInputDTO } from './dto/tag-input.dto';
import { TagDTO } from './dto/tag.dto';
import { TagEntity } from './tag.entity';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQuerySequelizeModule.forFeature([TagEntity])],
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
