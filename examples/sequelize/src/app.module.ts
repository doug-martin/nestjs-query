import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { SequelizeModule } from '@nestjs/sequelize';
import { GqlContext } from './auth.guard';
import { TagModule } from './tag/tag.module';
import { TodoItemModule } from './todo-item/todo-item.module';
import { SubTaskModule } from './sub-task/sub-task.module';
import { sequelizeOrmConfig } from '../../helpers';
import { resolve } from 'path';

@Module({
  imports: [
    SequelizeModule.forRoot(sequelizeOrmConfig('sequelize')),
    GraphQLModule.forRoot({
      autoSchemaFile: resolve(__dirname, '..', 'schema.gql'),
      context: ({ req }: { req: { headers: Record<string, string> } }): GqlContext => ({ request: req }),
    }),
    SubTaskModule,
    TodoItemModule,
    TagModule,
  ],
})
export class AppModule {}
