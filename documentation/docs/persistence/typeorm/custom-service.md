---
title: Custom Service
---

To create a custom query service to add your own methods to you can extend the `TypeOrmQueryService`.

:::note
When using a custom service you need to also create your `Resolver` instead of using the auto-generated one from `NestjsQueryGraphQLModule`
:::

```ts title="todo-item.service.ts"
import { QueryService } from '@nestjs-query/core'
import { TypeOrmQueryService } from '@nestjs-query/query-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TodoItemEntity } from './todo-item.entity';

@QueryService(TodoItemEntity)
export class TodoItemService extends TypeOrmQueryService<TodoItemEntity> {
  constructor(
    @InjectRepository(TodoItemEntity) repo: Repository<TodoItemEntity>,
  ) {
    super(repo);
  }

  async markAllAsCompleted(): Promise<number> {
     const entities = await this.query({ filter: { completed: { is: true } } });

     const { updatedCount } = await this.updateMany(
       { completed: true }, // update
       { id: { in: entities.map(e => e.id) } } // filter
     );
     // do some other business logic
     return updatedCount;
  }
}
```
