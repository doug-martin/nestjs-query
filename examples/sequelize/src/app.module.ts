import { ApolloDriver } from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { SequelizeModule } from '@nestjs/sequelize'

import { formatGraphqlError, sequelizeOrmConfig } from '../../helpers'
import { GqlContext } from './auth.guard'
import { SubTaskModule } from './sub-task/sub-task.module'
import { TagModule } from './tag/tag.module'
import { TodoItemModule } from './todo-item/todo-item.module'

@Module({
  imports: [
    SequelizeModule.forRoot(sequelizeOrmConfig('sequelize')),
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      context: ({ req }: { req: { headers: Record<string, string> } }): GqlContext => ({ request: req }),
      formatError: formatGraphqlError
    }),
    SubTaskModule,
    TodoItemModule,
    TagModule
  ]
})
export class AppModule {}
