import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeormOrmConfig } from '../../helpers';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ResourceAModule } from './resource-a/resource-a.module';
import { ResourceBModule } from './resource-b/resource-b.module';
import { ResourceCModule } from './resource-c/resource-c.module';

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
      autoSchemaFile: 'schema.gql',
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
    ResourceAModule,
    ResourceBModule,
    ResourceCModule,
  ],
})
export class AppModule {}
