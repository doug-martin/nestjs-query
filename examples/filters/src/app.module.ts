import { ApolloDriver } from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { TypeOrmModule } from '@nestjs/typeorm'

import { formatGraphqlError, typeormOrmConfig } from '../../helpers'
import { TodoItemModule } from './todo-item/todo-item.module'

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormOrmConfig('basic')),
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      formatError: formatGraphqlError
    }),
    TodoItemModule
  ]
})
export class AppModule {}
