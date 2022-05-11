import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoItemModule } from './todo-item/todo-item.module';
import { UserModule } from './user/user.module';
import { formatGraphqlError, typeormOrmConfig } from '../../helpers';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormOrmConfig('typeorm_multidb_1')),
    TypeOrmModule.forRoot(typeormOrmConfig('typeorm_multidb_2', 'typeorm_multidb_2', { name: 'user-connection' })),
    GraphQLModule.forRoot({
      autoSchemaFile: 'schema.gql',
      formatError: formatGraphqlError
    }),
    TodoItemModule,
    UserModule,
  ],
})
export class AppModule {}
