import { ApolloDriver } from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { TypeOrmModule } from '@nestjs/typeorm'

import { formatGraphqlError, typeormOrmConfig } from '../../../examples/helpers'
import { TodoItemModule } from './todo-item/todo-item.module'
import { UserModule } from './user/user.module'

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormOrmConfig('typeorm_multidb_1')),
    TypeOrmModule.forRoot(typeormOrmConfig('typeorm_multidb_2', 'typeorm_multidb_2', { name: 'user-connection' })),
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      formatError: formatGraphqlError
    }),
    TodoItemModule,
    UserModule
  ]
})
export class AppModule {}
