import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoItemModule } from './todo-item/todo-item.module';
import { typeormOrmConfig } from '../../helpers';
import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forRoot(),
    TypeOrmModule.forRoot(typeormOrmConfig('typeorm_soft_delete')),
    GraphQLModule.forRoot({
      autoSchemaFile: 'schema.gql',
    }),
    TodoItemModule,
  ],
})
export class AppModule {}
