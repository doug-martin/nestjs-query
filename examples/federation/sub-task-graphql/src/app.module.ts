import { Module } from '@nestjs/common';
import { GraphQLFederationModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubTaskModule } from './sub-task/sub-task.module';
import { typeormOrmConfig } from '../../../helpers';
import { resolve } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormOrmConfig('federation_sub_task')),
    GraphQLFederationModule.forRoot({
      autoSchemaFile: resolve(__dirname, '..', 'schema.gql'),
    }),
    SubTaskModule,
  ],
})
export class AppModule {}
