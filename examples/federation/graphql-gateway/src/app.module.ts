import { Module } from '@nestjs/common';
import { GraphQLGatewayModule } from '@nestjs/graphql';

@Module({
  imports: [
    GraphQLGatewayModule.forRoot({
      server: {
        // ... Apollo server options
        cors: true,
      },
      gateway: {
        serviceList: [
          { name: 'todo-items', url: 'http://localhost:3001/graphql' },
          { name: 'sub-tasks', url: 'http://localhost:3002/graphql' },
          { name: 'tags', url: 'http://localhost:3003/graphql' },
        ],
      },
    }),
  ],
})
export class AppModule {}
