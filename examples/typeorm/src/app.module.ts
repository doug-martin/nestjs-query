import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeormOrmConfig } from '../../helpers';
import { GqlContext } from './auth.guard';
import { SubTaskModule } from './sub-task/sub-task.module';
import { TagModule } from './tag/tag.module';
import { TodoItemModule } from './todo-item/todo-item.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormOrmConfig('typeorm')),
    GraphQLModule.forRoot({
      autoSchemaFile: 'schema.gql',
      context: ({ req }: { req: { headers: Record<string, string> } }): GqlContext => ({ request: req }),
    }),
    SubTaskModule,
    TodoItemModule,
    TagModule,
  ],
})
export class AppModule {}
