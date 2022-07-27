---
title: Custom Service
---

To create a custom query service to add your own methods to you can extend the `TypeOrmQueryService`.

```ts title="todo-item.service.ts"
import { QueryService } from '@codeshine/nestjs-query-core';
import { TypeOrmQueryService } from '@codeshine/nestjs-query-query-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TodoItemEntity } from './todo-item.entity';

@QueryService(TodoItemEntity)
export class TodoItemService extends TypeOrmQueryService<TodoItemEntity> {
  constructor(@InjectRepository(TodoItemEntity) repo: Repository<TodoItemEntity>) {
    super(repo);
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
import { NestjsQueryGraphQLModule } from '@codeshine/nestjs-query-query-graphql';
import { NestjsQueryTypeOrmModule } from '@codeshine/nestjs-query-query-typeorm';
import { Module } from '@nestjs/common';
import { TodoItemDTO } from './dto/todo-item.dto';
import { TodoItemEntity } from './todo-item.entity';
import { TodoItemService } from './todo-item.service';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQueryTypeOrmModule.forFeature([TodoItemEntity])],
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
