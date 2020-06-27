import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TodoItemModule } from './todo-item/todo-item.module';
import * as ormconfig from '../ormconfig.json';

@Module({
  imports: [
    TypeOrmModule.forRoot(ormconfig as TypeOrmModuleOptions),
    GraphQLModule.forRoot({
      autoSchemaFile: 'schema.gql',
    }),
    TodoItemModule,
  ],
})
export class AppModule {}
