---
title: Custom Service
---

To create a custom query service to add your own methods to you can extend the `SequelizeQueryService`.

```ts title="todo-item.service.ts"
import { QueryService } from '@codeshine/nestjs-query-core';
import { InjectModel } from '@nestjs/sequelize';
import { SequelizeQueryService } from '@codeshine/nestjs-query-sequelize';
import { TodoItemEntity } from './entity/todo-item.entity';

@QueryService(TodoItemEntity)
export class TodoItemService extends SequelizeQueryService<TodoItemEntity> {
  constructor(@InjectModel(TodoItemEntity) model: typeof TodoItemEntity) {
    super(model);
  }

  async markAllAsCompleted(): Promise<number> {
    const entities = await this.query({ filter: { completed: { is: false } } });

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
import { NestjsQueryGraphQLModule } from '@codeshine/nestjs-query-graphql';
import { NestjsQuerySequelizeModule } from '@codeshine/nestjs-query-sequelize';
import { Module } from '@nestjs/common';
import { TodoItemDTO } from './dto/todo-item.dto';
import { TodoItemEntity } from './todo-item.entity';
import { TodoItemService } from './todo-item.service';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQuerySequelizeModule.forFeature([TodoItemEntity])],
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
