import { ApolloDriver } from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { TypeOrmModule } from '@nestjs/typeorm'

import { formatGraphqlError, typeormOrmConfig } from '../../helpers'
import { ComplexityPlugin } from './complexity.plugin'
import { SubTaskModule } from './sub-task/sub-task.module'
import { TagModule } from './tag/tag.module'
import { TodoItemModule } from './todo-item/todo-item.module'

@Module({
  providers: [ComplexityPlugin],
  imports: [
    TypeOrmModule.forRoot(typeormOrmConfig('complexity')),
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      formatError: formatGraphqlError
    }),
    SubTaskModule,
    TodoItemModule,
    TagModule
  ]
})
export class AppModule {}
