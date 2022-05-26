import { Module } from '@nestjs/common';
import { GraphQLFederationModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubTaskModule } from './sub-task/sub-task.module';
import { typeormOrmConfig } from '../../../helpers';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormOrmConfig('federation_sub_task')),
    GraphQLFederationModule.forRoot({
      autoSchemaFile: 'schema.gql'
    }),
    SubTaskModule
  ]
})
export class AppModule {}
