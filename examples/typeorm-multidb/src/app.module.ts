import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoItemModule } from './todo-item/todo-item.module';
import { UserModule } from './user/user.module';
import { typeormOrmConfig } from '../../helpers';
import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forRoot(),
    TypeOrmModule.forRoot(typeormOrmConfig('typeorm_multidb_1')),
    TypeOrmModule.forRoot(typeormOrmConfig('typeorm_multidb_2', 'typeorm_multidb_2', { name: 'user-connection' })),
    GraphQLModule.forRoot({
      autoSchemaFile: 'schema.gql',
    }),
    TodoItemModule,
    UserModule,
  ],
})
export class AppModule {}
