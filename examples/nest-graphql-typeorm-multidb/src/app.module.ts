import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TodoItemModule } from './todo-item/todo-item.module';
import * as ormconfig from '../ormconfig.json';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(((ormconfig as unknown) as TypeOrmModuleOptions[])[0]),
    TypeOrmModule.forRoot(((ormconfig as unknown) as TypeOrmModuleOptions[])[1]),
    GraphQLModule.forRoot({
      autoSchemaFile: 'schema.gql',
      context: ({ req }) => ({ request: req }),
    }),
    TodoItemModule,
    UserModule,
  ],
})
export class AppModule {}
