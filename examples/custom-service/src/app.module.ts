import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { typeormOrmConfig } from '../../helpers';
import { TodoItemModule } from './todo-item/todo-item.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormOrmConfig('custom_service')),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
    }),
    TodoItemModule,
  ],
})
export class AppModule {}
