import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Module } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ResourceCDTO } from './resource-c.dto';
import { ResourceCEntity } from './resource-c.entity';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQueryTypeOrmModule.forFeature([ResourceCEntity])],
      resolvers: [
        {
          DTOClass: ResourceCDTO,
          EntityClass: ResourceCEntity,
          enableAggregate: true,
          enableSubscriptions: true,
          guards: [JwtAuthGuard],
        },
      ],
    }),
  ],
})
export class ResourceCModule {}
