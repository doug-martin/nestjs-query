import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { TodoItemModule } from './todo-item/todo-item.module';
import { typeormOrmConfig } from '../../../helpers';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormOrmConfig('federation_todo_item')),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: true,
    }),
    TodoItemModule,
  ],
})
export class AppModule {}
