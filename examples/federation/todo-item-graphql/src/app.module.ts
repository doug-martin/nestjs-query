import { Module } from '@nestjs/common';
import { GraphQLFederationModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoItemModule } from './todo-item/todo-item.module';
import { typeormOrmConfig } from '../../../helpers';
import { resolve } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormOrmConfig('federation_todo_item')),
    GraphQLFederationModule.forRoot({
      autoSchemaFile: resolve(__dirname, '..', 'schema.gql'),
    }),
    TodoItemModule,
  ],
})
export class AppModule {}
