import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagModule } from './tag/tag.module';
import { TodoItemModule } from './todo-item/todo-item.module';
import { SubTaskModule } from './sub-task/sub-task.module';
import { typeormOrmConfig } from '../../helpers';
import { resolve } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormOrmConfig('limit_offset')),
    GraphQLModule.forRoot({
      autoSchemaFile: resolve(__dirname, '..', 'schema.gql'),
    }),
    SubTaskModule,
    TodoItemModule,
    TagModule,
  ],
})
export class AppModule {}
