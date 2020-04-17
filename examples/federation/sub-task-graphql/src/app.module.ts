import { Module } from '@nestjs/common';
import { GraphQLFederationModule } from '@nestjs/graphql';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SubTaskModule } from './sub-task/sub-task.module';
import * as ormconfig from '../ormconfig.json';

@Module({
  imports: [
    TypeOrmModule.forRoot(ormconfig as TypeOrmModuleOptions),
    GraphQLFederationModule.forRoot({
      autoSchemaFile: 'schema.gql',
    }),
    SubTaskModule,
  ],
})
export class AppModule {}
