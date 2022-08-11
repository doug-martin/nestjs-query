import { ApolloFederationDriver } from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { TypeOrmModule } from '@nestjs/typeorm'

import { typeormOrmConfig } from '../../../helpers'
import { TodoItemModule } from './todo-item/todo-item.module'

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormOrmConfig('federation_todo_item')),
    GraphQLModule.forRoot({
      driver: ApolloFederationDriver,
      autoSchemaFile: 'schema.gql'
    }),
    TodoItemModule
  ]
})
export class AppModule {}
