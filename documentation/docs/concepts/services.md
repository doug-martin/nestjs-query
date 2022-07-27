---
title: QueryService
---

The `core` package defines a `QueryService` which is used to query and modify records.

## Methods

The following methods are defined on the `QueryService`

### `query`

Query for multiple records, with a filter, paging and sorting.

#### Arguments

- `query: Query<DTO>` - The query to filter, page, and sort results.

#### Returns

An array of DTOs

### `findById`

Find a record by its id.

#### Arguments

- `id: string | number` - The id of the record to find

#### Returns

The DTO or undefined

### `getById`

- get a record by its id or return a rejected promise with a NotFound error.

#### Arguments

- `id: string | number` - The id of the record to find

#### Returns

The DTO or a NotFoundException.

### `createMany`

Create multiple records.

#### Arguments

- `items: DeepPartial<DTO>[]` - An array of partial DTOs to persist

#### Returns

The saved DTOs.

### `createOne`

Create a single DTO.

#### Arguments

- `item: DeepPartial<DTO>` - A partial of the DTO to persist

#### Returns

The saved DTO

### `updateMany`

Update multiple records based on a filter.

#### Arguments

- `update: DeepPartial<DTO>` - The update to apply
- `filter: Filter<DTO>` - A `Filter` used to find the records to update

#### Returns

An object with the `updatedCount`

:::note
UpdatedCount may be 0 if the database does not return the number of rows updated.
:::

### `updateOne`

Update a single record.

#### Arguments

- `id: string | number` - The id of the record to update
- `update: DeepPartial<DTO>` - The update to apply

#### Returns

The updated DTO

### `deleteMany`

Delete multiple records.

#### Arguments

- `filter: Filter<DTO>` - The filter to find the records to delete.

#### Returns

An object with a `deletedCount` field.

:::note
`deletedCount` may be 0 if the database does not return the number of rows deleted.
:::

:::

### `deleteOne`

Delete a single record.

#### Arguments

- `id: number | string`

#### Returns

`Promise<DTO>`

### `aggregate`

Performs an aggregate query, supported aggregate functions are `groupBy`, `count`, `sum`, `avg`, `min`, and `max`

#### Arguments

- `filter: Filter<DTO>` - Additional filter to apply
- `aggregate: AggregateQuery<DTO>` - The aggregate query

Example `AggregateQuery`

```ts
{
  count: ['id'],
  sum: ['priority'],
  avg: ['priority'],
  min: ['id', 'title'],
  max: ['id', 'title']
}
```

#### Returns

An array of aggregate responses.

Example `AggregateResponse`

```ts
[
  {
    count: { id: 5 },
    sum: { id: 10 },
    avg: { id: 2.5 },
    min: { id: 1, title: 'A Title' },
    max: { id: 4, title: 'Z Title' },
  },
];
```

### `count`

Count the number of records that match the `filter`

#### Arguments

- `filter: Filter<DTO>` - The filter a count records by

#### Returns

A count of records that match the `filter`

### `queryRelations`

Query for relations

#### Arguments

- `RelationClass: Class<Relation>` - The `Class` type of the relation
- `relationName: string` - The name of the relation
- `dto: DTO | DTO[]` - The dto(s) to find the relations for.
- `query: Query<Relation>` - Additional query to use when querying for relations.

#### Returns

If querying for relations for a single `DTO` an array of relations will be returned.
If querying for relations for multiple `DTOs` a map where the key is the `DTO` and the value is the relations for the `DTO`.

### `aggregateRelations`

Performs an aggregate query for the relations of a `DTO`.

#### Arguments

- `RelationClass: Class<Relation>` - The `Class` type of the relation
- `relationName: string` - The name of the relation
- `dto: DTO | DTO[]` - The dto(s) to aggregate the relations for.
- `filter: Filter<Relation>` - A `filter` to apply when aggregating relations
- `aggregate: AggregateQuery<Relation>` - The `aggregateQuery` for the relations

#### Returns

If aggregating relations for a single `DTO` an `AggregateResponse` for the dtos relations will be returned
If aggregating relations for multiple `DTOs` a map where the key is the `DTO` and the value is the `AggregateResponse` for the dtos relations.

### `countRelations`

Counts the number of relations.

#### Arguments

- `RelationClass: Class<Relation>` - The `Class` type of the relation
- `relationName: string` - The name of the relation
- `dto: DTO | DTO[]` - The dto(s) to count the relations for.
- `filter: Filter<Relation>`- A `filter` to apply when counting relations

#### Returns

If counting relations for a single `DTO` the relation count will be returned
If counting relations for multiple `DTOs` a map where the key is the `DTO` and the value is relation count for the dtos relations.

### `findRelation`

Find a single relation for the `DTO`(s).

#### Arguments

- `RelationClass: Class<Relation>` - The `Class` type of the relation
- `relationName: string` - The name of the relation
- `dto: DTO | DTO[]` - The dto(s) to find the relation for.
- `opts?: FindRelationOptions<Relation>` - Additional options to find a relation by.

#### Returns

If finding a relation for a single `DTO` the relation or undefineding returned
If finding a relation for multiple `DTOs` a map where the key is the `DTO` and the value is the relation or undefined.

### `addRelations`

Adds relations to a `DTO`

#### Arguments

- `relationName: string` - The name of the relation
- `id: string | number` - The id of the DTO to add the relations to
- `relationIds: (string | number)[]` - The ids of the relations to add
- `opts?: ModifyRelationOptions<DTO, Relation>` - Additional options apply when adding relations

#### Returns

The DTO the relations were added to.

### `setRelations`

Sets relations on a `DTO`

#### Arguments

- `relationName: string` - The name of the relation
- `id: string | number` - The id of the DTO to add the relations to
- `relationIds: (string | number)[]` - The ids of the relations to set. If the relationIds is empty the all relations will be removed.
- `opts?: ModifyRelationOptions<DTO, Relation>` - Additional options apply when adding relations

#### Returns

The DTO the relations were added to.

### `setRelation`

Set a relation on a DTO

#### Arguments

- `relationName: string` - The name of the relation
- `id: string | number` - The id of the DTO to add the relations to
- `relationId: string | number` - The id of the relation to set on the DTO
- `opts?: ModifyRelationOptions<DTO, Relation>` - Additional options apply when setting the relation

#### Returns

The DTO the relation was set on.

### `removeRelations`

Removes multiple relations from a DTO

#### Arguments

- `relationName: string` - The name of the relation
- `id: string | number` - The id of the DTO to remove the relations from.
- `relationIds: (string | number)[]` - The ids of the relations to remove
- `opts?: ModifyRelationOptions<DTO, Relation>` - Additional options to apply when removing relations

#### Returns

The DTO the relations were removed from

### `removeRelation`

Remove a relation from a DTO

#### Arguments

- `relationName: string` - The name of the relation
- `id: string | number` - The id of the DTO to remove the relation from.
- `relationId: string | number` - The id of the relation to remove
- `opts?: ModifyRelationOptions<DTO, Relation>` - Additional options to apply when removing the relation.

#### Returns

The DTO the relation was removed from.

## Service Helpers

You can create your own service to use with the `CRUDResolver` as long as it implements the `QueryService` interface.

There are a number of persistence `QueryServices` that are provided out of the box.

- [@codeshine/nestjs-query-typeorm](../persistence/typeorm/getting-started.md)
- [@codeshine/nestjs-query-sequelize](../persistence/sequelize/getting-started.md)
- [@codeshine/nestjs-query-mongoose](../persistence/mongoose/getting-started.md)

In addition to the persistence `QueryServices` `@codeshine/nestjs-query-core` provides a few helper services that can be used for more complex use cases.

When designing the base services we have chosen composition over inheritance. This approach lends itself well to modeling complex services without repeating yourself.

### RelationQueryService

The RelationQueryService was originally designed for [federation](../graphql/federation.mdx), but has proven itself useful in representing virtual relations. A virtual relation(s) is anything that can be queried through a query service.

To create additional relations through a RelationQueryService you need to provide the following

- A `QueryService` that can be used to fetch the relation
- A `query` function that accepts the parent DTO to fetch the relation for and returns a `Query` to fetch the relations.

:::info
Relations defined using the `RelationQueryService` are readonly!
:::

When a relation query method is called it will:

- First check if the relation is a virtual relation, if `true` it will invoke the `query` option to generate a query that will be
  passed to the `queryService` to fetch the relations.
- If the relation is not a `virtual` relation it will proxy to the original query service to query for the relation.

For example, we could wrap the `TodoItem` query service and add a `completedSubTasks` relation.

```ts title="todo-item/todo-item.service.ts"
import { InjectQueryService, QueryService, RelationQueryService } from '@codeshine/nestjs-query-core';
import { TodoItemEntity } from './todo-item.entity';
import { SubTaskEntity } from '../sub-task/sub-task.entity';

export class TodoItemService extends RelationQueryService<TodoItemEntity> {
  constructor(
    @InjectQueryService(TodoItemEntity) queryService: QueryService<TodoItemEntity>,
    @InjectQueryService(SubTaskEntity) subTaskQueryService: QueryService<SubTaskEntity>,
  ) {
    // provide the original query service so all relations defined in the ORM work
    super(queryService, {
      // specify the virtual relations
      completedSubTasks: {
        // provide the service that will be used to query the relation
        service: subTaskQueryService,
        // the query method accepts a todoItem that can be used to filter the relations
        query(todoItem) {
          // filter for all relations that belong to the todoItem and are completed
          return { filter: { todoItemId: { eq: todoItem.id }, completed: { is: true } } };
        },
      },
    });
  }
}
```

Once the `relation` is defined in the query service we can add it to our `DTO` to expose it in our schema.

```ts title="todo-item/todo-item.dto.ts"
import { FilterableField, IDField, FilterableConnection, KeySet } from '@codeshine/nestjs-query-graphql';
import { ObjectType, ID, GraphQLISODateTime, Field } from '@nestjs/graphql';
import { SubTaskDTO } from '../../sub-task/dto/sub-task.dto';

@ObjectType('TodoItem')
@KeySet(['id'])
@FilterableConnection('subTasks', () => SubTaskDTO, { disableRemove: true })
@FilterableConnection('completedSubTasks', () => SubTaskDTO, {
  // disable remove and update because it is a virtual relation
  disableRemove: true,
  disableUpdate: true,
})
export class TodoItemDTO {
  @IDField(() => ID)
  id!: number;

  @FilterableField()
  title!: string;

  @FilterableField({ nullable: true })
  description?: string;

  @FilterableField()
  completed!: boolean;

  @FilterableField(() => GraphQLISODateTime)
  created!: Date;

  @FilterableField(() => GraphQLISODateTime)
  updated!: Date;
}
```

Next we need to export the `SubTask` query service from the `SubTaskModule` so we can resolve it in the
`TodoItemService`.

```ts title='sub-task/sub-task.module.ts'
import { NestjsQueryGraphQLModule } from '@codeshine/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@codeshine/nestjs-query-typeorm';
import { Module } from '@nestjs/common';
import { SubTaskDTO } from './dto/sub-task.dto';
import { SubTaskEntity } from './sub-task.entity';

// define the persistence module so it can be exported
const nestjsQueryTypeOrmModule = NestjsQueryTypeOrmModule.forFeature([SubTaskEntity]);

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      // import it in the graphql module
      imports: [nestjsQueryTypeOrmModule],
      resolvers: [
        {
          DTOClass: SubTaskDTO,
          EntityClass: SubTaskEntity,
        },
      ],
    }),
    // import it into the subTaskModule so it can be exported
    nestjsQueryTypeOrmModule,
  ],
  // export the persistence module so it can be used by the TodoItemService
  exports: [nestjsQueryTypeOrmModule],
})
export class SubTaskModule {}
```

Now we can import the `SubTaskModule` into the `TodoItemModule` so the `SubTask` query service can be injected into
the `TodoItemService`.

```ts title="todo-item/todo-item.module.ts"
import { NestjsQueryGraphQLModule } from '@codeshine/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@codeshine/nestjs-query-typeorm';
import { Module } from '@nestjs/common';
import { TodoItemDTO } from './dto/todo-item.dto';
import { TodoItemAssembler } from './todo-item.assembler';
import { TodoItemEntity } from './todo-item.entity';
import { TodoItemResolver } from './todo-item.resolver';
import { TodoItemService } from './todo-item.service';
import { SubTaskModule } from '../sub-task/sub-task.module';

@Module({
  providers: [TodoItemResolver],
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      // import the persistence module for the TodoItemEntity and the SubTaskModule
      imports: [NestjsQueryTypeOrmModule.forFeature([TodoItemEntity]), SubTaskModule],
      services: [TodoItemService],
      assemblers: [TodoItemAssembler],
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

The `completedSubTasks` relation is now available in your graphql schema.

### ProxyQueryService

The `ProxyQueryService` is a query service that delegates to another query service. The `ProxyQueryService` can be used when you want to override certain methods of a query service without extending it.

This class is used internally by the [RelationQueryService](#relation-query-service) to override the relation methods for a `QueryService`

Lets use the `ProxyQueryService` to create a generic query service that will time and log a message everytime a `create`, `update`, or `delete` method is called.

To start lets define a `MutationLoggerQueryService`.

```ts title="utilities/mutation-logger-query.service.ts"
import { Logger, LoggerService } from '@nestjs/common';
import { DeepPartial } from '../common';
import { Filter, DeleteManyResponse, DeleteOneOptions, UpdateManyResponse, UpdateOneOptions } from '../interfaces';
import { ProxyQueryService } from './proxy-query.service';
import { QueryService } from './query.service';

export class MutationLoggerQueryService<DTO, C = DeepPartial<DTO>, U = DeepPartial<DTO>> extends ProxyQueryService<
  DTO,
  C,
  U
> {
  private readonly logger: LoggerService;

  constructor(label: string, queryService: QueryService<DTO, C, U>) {
    // call super witht the QueryService we will delegate to
    super(queryService);
    // create our logger
    this.logger = new Logger(label);
  }

  // Override all the create, update, and delete methods to add the timed logging functionality
  createMany(items: C[]): Promise<DTO[]> {
    return this.timedLog(`create many [itemCount=${items.length}]`, () => super.createMany(items));
  }

  createOne(item: C): Promise<DTO> {
    return this.timedLog(`create one`, () => super.createOne(item));
  }

  deleteMany(filter: Filter<DTO>): Promise<DeleteManyResponse> {
    return this.timedLog(`delete many`, () => super.deleteMany(filter));
  }

  deleteOne(id: number | string, opts?: DeleteOneOptions<DTO>): Promise<DTO> {
    return this.timedLog(`delete one [id=${id}]`, () => super.deleteOne(id, opts));
  }

  updateMany(update: U, filter: Filter<DTO>): Promise<UpdateManyResponse> {
    return this.timedLog('update many', () => super.updateMany(update, filter));
  }

  updateOne(id: string | number, update: U, opts?: UpdateOneOptions<DTO>): Promise<DTO> {
    return this.timedLog(`update one [id=${id}]`, () => super.updateOne(id, update, opts));
  }

  private async timedLog<T>(message, fn: () => Promise<T>): Promise<T> {
    const start = new Date();
    const result = await fn();
    const duration = start.getTime() - new Date().getTime();
    this.logger.log(`${message} [duration=${duration}]`);
    return result;
  }
}
```

We can now add timed logging to any query service.

Lets add it to our `TodoItemQueryService`

```ts title="todo-item/todo-item.service.ts"
import { InjectQueryService, QueryService } from '@codeshine/nestjs-query-core';
import { MutationLoggerQueryService } from '../utilities/mutation-logger-query.service';
import { TodoItemEntity } from './todo-item.entity';

@QueryService(TodoItemEntity)
export class TodoItemService extends MutationLoggerQueryService<TodoItemEntity> {
  constructor(@InjectQueryService(TodoItemEntity) service: QueryService<TodoItemEntity>) {
    // provide the logger name and the service
    super(TodoItemService.name, service);
  }
}
```

Don't forget to use your custom query service in your module

```ts title="todo-item/todo-item.module.ts"
import { NestjsQueryGraphQLModule } from '@codeshine/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@codeshine/nestjs-query-typeorm';
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

### NoOpQueryService

The no-op query service is one that will throw a `NotImplementedException` for every method.

This is commonly used during testing when you want to mock out a service.

You can also use the `NoOpQueryService` as a base a new query service that only supports a subset of operations.

In this example we'll create a simple query service that stores elements in an array but does not support relations or aggregations.

```ts
import {
  applyFilter,
  applyQuery,
  DeleteManyResponse,
  DeleteOneOptions,
  Filter,
  FindByIdOptions,
  GetByIdOptions,
  NoOpQueryService,
  Query,
  QueryService,
  UpdateManyResponse,
  UpdateOneOptions,
} from '@codeshine/nestjs-query-core';
import { NotFoundException } from '@nestjs/common';
import { TodoItemEntity } from './todo-item.entity';

@QueryService(TodoItemEntity)
export class TodoItemService extends NoOpQueryService<TodoItemEntity> {
  private records: TodoItemEntity[];

  constructor() {
    super();
    this.records = [];
  }

  createMany(items: TodoItemEntity[]): Promise<TodoItemEntity[]> {
    this.records.push(...items);
    return Promise.resolve(items);
  }

  createOne(item: TodoItemEntity): Promise<TodoItemEntity> {
    this.records.push(item);
    return Promise.resolve(item);
  }

  async updateMany(update: Partial<TodoItemEntity>, filter: Filter<TodoItemEntity>): Promise<UpdateManyResponse> {
    const recordsToUpdate = await this.query({ filter });
    recordsToUpdate.forEach((r) => Object.assign(r, update));
    return { updatedCount: recordsToUpdate.length };
  }

  async updateOne(
    id: string | number,
    update: Partial<TodoItemEntity>,
    opts?: UpdateOneOptions<TodoItemEntity>,
  ): Promise<TodoItemEntity> {
    const record = await this.getById(id, opts);
    return Object.assign(record, update);
  }

  async deleteMany(filter: Filter<TodoItemEntity>): Promise<DeleteManyResponse> {
    const recordIds = (await this.query({ filter })).map((r) => r.id);
    this.records = this.records.filter((r) => !recordIds.includes(r.id));
    return Promise.resolve({ deletedCount: recordIds.length });
  }

  async deleteOne(id: number | string, opts?: DeleteOneOptions<TodoItemEntity>): Promise<TodoItemEntity> {
    const record = await this.getById(id, opts);
    this.records = this.records.filter((r) => r.id !== record.id);
    return Promise.resolve(record);
  }

  findById(id: string | number, opts?: FindByIdOptions<TodoItemEntity>): Promise<TodoItemEntity | undefined> {
    const record = applyFilter(this.records, opts?.filter ?? {}).find((r) => r.id === id);
    return Promise.resolve(record);
  }

  async getById(id: string | number, opts?: GetByIdOptions<TodoItemEntity>): Promise<TodoItemEntity> {
    const record = await this.findById(id, opts);
    if (!record) {
      throw new NotFoundException(`Unable to find TodoItem with id ${id}`);
    }
    return record;
  }

  query(query: Query<TodoItemEntity>): Promise<TodoItemEntity[]> {
    return Promise.resolve(applyQuery(this.records, query));
  }

  async count(filter: Filter<TodoItemEntity>): Promise<number> {
    const found = await this.query({ filter });
    return found.length;
  }
}
```
