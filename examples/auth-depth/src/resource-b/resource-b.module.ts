import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Module } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ResourceBDTO } from './resource-b.dto';
import { ResourceBEntity } from './resource-b.entity';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQueryTypeOrmModule.forFeature([ResourceBEntity])],
      resolvers: [
        {
          DTOClass: ResourceBDTO,
          EntityClass: ResourceBEntity,
          enableAggregate: true,
          enableSubscriptions: true,
          guards: [JwtAuthGuard],
        },
      ],
    }),
  ],
})
export class ResourceBModule {}
