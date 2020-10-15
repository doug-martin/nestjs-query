---
title: Custom Service
---

To create a custom query service to add your own methods to you can extend the `SequelizeQueryService`.

```ts title="todo-item.service.ts"
import { QueryService } from '@nestjs-query/core';
import { InjectModel } from '@nestjs/mongoose';
import { MongooseQueryService } from '@nestjs-query/query-mongoose';
import { TodoItemEntity } from './entity/todo-item.entity';

@QueryService(TodoItemEntity)
export class TodoItemService extends MongooseQueryServices<TodoItemEntity> {
  constructor(@InjectModel(TodoItemEntity.name) model:  Model<TodoItemEntity>) {
    super(model);
  }

  async markAllAsCompleted(): Promise<number> {
    const entities = await this.query({ filter: { completed: { is: true } } });

    const { updatedCount } = await this.updateMany(
      { completed: true }, // update
      { id: { in: entities.map((e) => e.id) } }, // filter
    );
    // do some other business logic
    return updatedCount;
  }
}
```

To use the custom service in the auto-generated resolver you can specify the `ServiceClass` option.

```ts title="todo-item.module.ts" {12,16}
import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';
import { NestjsQueryMongooseModule } from '@nestjs-query/query-mongoose';
import { Module } from '@nestjs/common';
import { TodoItemDTO } from './dto/todo-item.dto';
import { TodoItemEntity } from './todo-item.entity';
import { TodoItemService } from './todo-item.service';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryMongooseModule.forFeature([
          { document: TodoItemEntity, name: TodoItemEntity.name, schema: TodoItemEntitySchema },
        ]),
      ],
      services: [TodoItemService],
      resolvers: [
        {
          DTOClass: TodoItemDTO,
          ServiceClass: TodoItemService,
        },
      ],
    }),
  ],
})
export class TodoItemModule {}

```
