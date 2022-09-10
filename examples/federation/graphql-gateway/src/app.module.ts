import { ApolloFederationDriver } from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'

@Module({
  imports: [
    GraphQLModule.forRoot({
      driver: ApolloFederationDriver,
      autoSchemaFile: 'schema.gql',
      server: {
        // ... Apollo server options
        cors: true
      },
      gateway: {
        serviceList: [
          { name: 'todo-items', url: 'http://localhost:3001/graphql' },
          { name: 'sub-tasks', url: 'http://localhost:3002/graphql' },
          { name: 'tags', url: 'http://localhost:3003/graphql' },
          { name: 'user', url: 'http://localhost:3004/graphql' }
        ]
      }
    })
  ]
})
export class AppModule {}
