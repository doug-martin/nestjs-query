import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoItemModule } from './todo-item/todo-item.module';
import { typeormOrmConfig } from '../../helpers';
import { resolve } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormOrmConfig('typeorm_soft_delete')),
    GraphQLModule.forRoot({
      autoSchemaFile: resolve(__dirname, '..', 'schema.gql'),
    }),
    TodoItemModule,
  ],
})
export class AppModule {}
