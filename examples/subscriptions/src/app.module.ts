import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagModule } from './tag/tag.module';
import { TodoItemModule } from './todo-item/todo-item.module';
import { SubTaskModule } from './sub-task/sub-task.module';
import { typeormOrmConfig } from '../../helpers';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormOrmConfig('subscription')),
    GraphQLModule.forRoot({
      subscriptions: {
        'graphql-ws': true,
      },
      autoSchemaFile: 'schema.gql',
    }),
    SubTaskModule,
    TodoItemModule,
    TagModule,
  ],
})
export class AppModule {}
