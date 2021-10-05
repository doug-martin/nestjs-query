import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Module } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ResourceADTO } from './resource-a.dto';
import { ResourceAEntity } from './resource-a.entity';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQueryTypeOrmModule.forFeature([ResourceAEntity])],
      resolvers: [
        {
          DTOClass: ResourceADTO,
          EntityClass: ResourceAEntity,
          enableAggregate: true,
          enableSubscriptions: true,
          guards: [JwtAuthGuard],
        },
      ],
    }),
  ],
})
export class ResourceAModule {}
