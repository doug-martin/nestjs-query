import { TypegooseModule } from '@m8a/nestjs-typegoose'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'

import { formatGraphqlError, mongooseConfig } from '../../helpers'
import { GqlContext } from './auth.guard'
import { SubTaskModule } from './sub-task/sub-task.module'
import { TagModule } from './tag/tag.module'
import { TodoItemModule } from './todo-item/todo-item.module'

const { uri, ...options } = mongooseConfig('typegoose', {})

@Module({
  imports: [
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    TypegooseModule.forRoot(uri, options),
    GraphQLModule.forRoot<ApolloDriverConfig>({
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
