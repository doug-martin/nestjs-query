import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagModule } from './tag/tag.module';
import { TodoItemModule } from './todo-item/todo-item.module';
import { SubTaskModule } from './sub-task/sub-task.module';
import { typeormOrmConfig } from '../../helpers';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';

interface HeadersContainer {
  rawHeaders: string[];
  headers: Record<string, string>;
}
interface ContextArgs {
  req?: HeadersContainer;
  connection?: { context: HeadersContainer };
}

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormOrmConfig('auth')),
    NestjsQueryGraphQLModule.forRoot(),
    GraphQLModule.forRoot({
      autoSchemaFile: 'schema.gql',
      installSubscriptionHandlers: true,
      subscriptions: {
        'subscriptions-transport-ws': {
          onConnect: (connectionParams: unknown) => ({ headers: connectionParams }),
        },
      },
      context: ({ req, connection }: ContextArgs) => {
        let headers = {};
        const idx = req?.rawHeaders?.findIndex((h) => h === 'Authorization');
        if (idx && req) {
          headers = {
            Authorization: req.rawHeaders[idx + 1],
          };
        }
        return {
          req: {
            ...req,
            ...connection?.context,
            headers: { ...headers, ...req?.headers },
          },
        };
      },
    }),
    AuthModule,
    UserModule,
    TodoItemModule,
    SubTaskModule,
    TagModule,
  ],
})
export class AppModule {}
