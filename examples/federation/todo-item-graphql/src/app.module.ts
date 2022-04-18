import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoItemModule } from './todo-item/todo-item.module';
import { typeormOrmConfig } from '../../../helpers';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormOrmConfig('federation_todo_item')),
    GraphQLModule.forRoot<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
    }),
    TodoItemModule,
  ],
})
export class AppModule {}
