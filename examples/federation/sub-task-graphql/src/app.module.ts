import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { SubTaskModule } from './sub-task/sub-task.module';
import { typeormOrmConfig } from '../../../helpers';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormOrmConfig('federation_sub_task')),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: true,
    }),
    SubTaskModule,
  ],
})
export class AppModule {}
