import { ApolloFederationDriver } from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { TypeOrmModule } from '@nestjs/typeorm'

import { typeormOrmConfig } from '../../../helpers'
import { SubTaskModule } from './sub-task/sub-task.module'

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormOrmConfig('federation_sub_task')),
    GraphQLModule.forRoot({
      driver: ApolloFederationDriver,
      autoSchemaFile: 'schema.gql'
    }),
    SubTaskModule
  ]
})
export class AppModule {}
