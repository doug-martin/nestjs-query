import { Module } from '@nestjs/common';
import { GraphQLFederationModule } from '@nestjs/graphql';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TagModule } from './tag/tag.module';
import * as ormconfig from '../ormconfig.json';

@Module({
  imports: [
    TypeOrmModule.forRoot(ormconfig as TypeOrmModuleOptions),
    GraphQLFederationModule.forRoot({
      autoSchemaFile: 'schema.gql',
    }),
    TagModule,
  ],
})
export class AppModule {}
