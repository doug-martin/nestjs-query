import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';
import { Module } from '@nestjs/common';
import { TagInputDTO } from './dto/tag-input.dto';
import { TagDTO } from './dto/tag.dto';
import { TagEntity } from './tag.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQueryTypeOrmModule.forFeature([TagEntity])],
      resolvers: [
        {
          DTOClass: TagDTO,
          EntityClass: TagEntity,
          CreateDTOClass: TagInputDTO,
          UpdateDTOClass: TagInputDTO,
          enableAggregate: true,
          enableSubscriptions: true,
          guards: [JwtAuthGuard]
        }
      ]
    })
  ]
})
export class TagModule {}
