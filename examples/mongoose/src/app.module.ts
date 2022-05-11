import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import { GqlContext } from './auth.guard';
import { TagModule } from './tag/tag.module';
import { TodoItemModule } from './todo-item/todo-item.module';
import { SubTaskModule } from './sub-task/sub-task.module';
import { formatGraphqlError, mongooseConfig } from '../../helpers';

const { uri, ...options } = mongooseConfig('mongoose');
@Module({
  imports: [
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    MongooseModule.forRoot(uri!, options),
    GraphQLModule.forRoot({
      autoSchemaFile: 'schema.gql',
      context: ({ req }: { req: { headers: Record<string, string> } }): GqlContext => ({ request: req }),
      formatError: formatGraphqlError
    }),
    SubTaskModule,
    TodoItemModule,
    TagModule,
  ],
})
export class AppModule {}
