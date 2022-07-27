---
title: Soft Delete
---

`TypeOrm` supports [soft deletes](https://typeorm.io/#/delete-query-builder/soft-delete). This feature does not delete records but instead updates the column decorated with `@DeletedDateColumn`.

Before continuing it is recommended that you read the following.

- https://typeorm.io/#/decorator-reference/deletedatecolumn
- https://typeorm.io/#/delete-query-builder/soft-delete

## Setting up your entity.

Before enabling soft deletes you must add the DeletedDateColumn to your entity.

```ts title="todo-item.entity.ts"
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity({ name: 'todo_item' })
export class TodoItemEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  completed!: boolean;

  @CreateDateColumn()
  created!: Date;

  @UpdateDateColumn()
  updated!: Date;

  // Add this column to your entity!
  @DeleteDateColumn()
  deletedAt?: Date;
}
```

The important column is the `deletedAt` column in the above example. Without this column soft deletes will not work. If you add this column all reads from the `typeorm` repository will add a where clause checking that the column `IS NULL`.

## Soft Delete Service

Once you have added the column to your entity you need to declare your service setting the `useSoftDelete` flag.

```ts title="todo-item.service.ts"
import { QueryService } from '@codeshine/nestjs-query-core';
import { TypeOrmQueryService } from '@codeshine/nestjs-query-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TodoItemEntity } from './todo-item.entity';

@QueryService(TodoItemEntity)
export class TodoItemService extends TypeOrmQueryService<TodoItemEntity> {
  constructor(@InjectRepository(TodoItemEntity) repo: Repository<TodoItemEntity>) {
    // pass the use soft delete option to the service.
    super(repo, { useSoftDelete: true });
  }
}
```

Notice that when calling `super` the `useSoftDelete` option is set to `true`. This will ensure that all `deletes` use the `softRemove` when deleting one or `softDelete` when deleting many.

### Adding restore mutations.

`nestjs-query` does not automatically expose `restore` mutations. In this example we add the restore mutations.

```ts title="todo-item.resolver.ts"
import { UpdateManyResponse, Filter } from '@codeshine/nestjs-query-core';
import { CRUDResolver, FilterType, UpdateManyResponseType } from '@codeshine/nestjs-query-graphql';
import { Resolver, Args, Mutation, ID } from '@nestjs/graphql';
import { TodoItemDTO } from './dto/todo-item.dto';
import { TodoItemService } from './todo-item.service';

@Resolver(() => TodoItemDTO)
export class TodoItemResolver extends CRUDResolver(TodoItemDTO) {
  constructor(readonly service: TodoItemService) {
    super(service);
  }

  // restore one mutation will update the `deletedAt` column to null.
  @Mutation(() => TodoItemDTO)
  restoreOneTodoItem(@Args('input', { type: () => ID }) id: number): Promise<TodoItemDTO> {
    return this.service.restoreOne(id);
  }

  // restore many mutation will update the `deletedAt` column to null for all todo items that
  // match the filter.
  @Mutation(() => UpdateManyResponseType())
  restoreManyTodoItems(
    @Args('input', { type: () => FilterType(TodoItemDTO) }) filter: Filter<TodoItemDTO>,
  ): Promise<UpdateManyResponse> {
    return this.service.restoreMany(filter);
  }
}
```

## Complete Example

To see a complete example [see here.](https://github.com/doug-martin/nestjs-query/tree/master/examples/typeorm-soft-delete)
