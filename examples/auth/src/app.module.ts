import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagModule } from './tag/tag.module';
import { TodoItemModule } from './todo-item/todo-item.module';
import { SubTaskModule } from './sub-task/sub-task.module';
import { typeormOrmConfig } from '../../helpers';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { resolve } from 'path';

interface HeadersContainer {
  headers?: Record<string, string>;
}
interface ContextArgs {
  req?: HeadersContainer;
  connection?: { context: HeadersContainer };
}

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormOrmConfig('auth')),
    GraphQLModule.forRoot({
      autoSchemaFile: resolve(__dirname, '..', 'schema.gql'),
      installSubscriptionHandlers: true,
      subscriptions: {
        'subscriptions-transport-ws': {
          onConnect: (connectionParams: unknown) => ({ headers: connectionParams }),
        },
      },
      context: ({ req, connection }: ContextArgs) => ({ req: { ...req, ...connection?.context } }),
    }),
    AuthModule,
    UserModule,
    TodoItemModule,
    SubTaskModule,
    TagModule,
  ],
})
export class AppModule {}
