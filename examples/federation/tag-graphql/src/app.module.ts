import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { TagModule } from './tag/tag.module';
import { typeormOrmConfig } from '../../../helpers';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormOrmConfig('federation_tag')),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: true,
    }),
    TagModule,
  ],
})
export class AppModule {}
