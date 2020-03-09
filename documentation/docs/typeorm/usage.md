---
title: Usage
---

All examples assume the following [entity](https://typeorm.io/#/entities).

```ts
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class TodoItemEntity {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
  title!: string;

  @Column()
  completed!: boolean;

  @CreateDateColumn()
  created!: Date;

  @UpdateDateColumn()
  updated!: Date;
}

```

## Creating a Service

The `@nestjs-query/query-typeorm` package includes a `@InjectTypeOrmQueryService` decorator that creates your `TypeOrmQueryService` automatically.

**NOTE** In this example the DTO and entity are the same shape, if you have a case where they are different or have computed fields check out [Assemblers](../concepts/assemblers) to understand how to convert to and from the DTO/Entity.

```ts
import { QueryService } from '@nestjs-query/core';
import { CRUDResolver } from '@nestjs-query/query-graphql';
import { Resolver } from '@nestjs/graphql';
import { InjectTypeOrmQueryService } from '@nestjs-query/query-typeorm';
import { TodoItemDTO } from './todo-item.dto';
import { TodoItemEntity } from './todo-item.entity';

@Resolver(() => TodoItemDTO)
export class TodoItemResolver extends CRUDResolver(TodoItemDTO) {
  constructor(
    @InjectTypeOrmQueryService(TodoItemEntity) readonly service: QueryService<TodoItemEntity>
  ) {
    super(service);
  }
}
```

### Module

In order to use the `@InjectTypeOrmQueryService` you will need to use the `NestjsQueryTypeOrmModule`.

The `NestjsQueryTypeOrmModule` wraps the `@nestjs-query/typeorm` module and adds the additional decorators.

```ts
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Module } from '@nestjs/common';
import { TodoItemEntity } from './todo-item.entity';
import { TodoItemResolver } from './todo-item.resolver';

@Module({
  providers: [TodoItemResolver],
  imports: [NestjsQueryTypeOrmModule.forFeature([TodoItemEntity])],
})
export class TodoItemModule {}

```

### Querying

To query for records from your service you can use the `query` method which will return a `Promise` of an array of entities. To read more about querying take a look at the [Queries Doc](../concepts/queries).

#### Example

Get all records

```ts
const records = await this.service.query({});
```

### Filtering

The `filter` option is translated to a `WHERE` clause in `typeorm`.

#### Example

To find all completed `TodoItems` by use can use the `is` operator.

```ts
const records = await this.service.query({
   filter : {
     completed: { is: true },
   },
});
```

### Sorting

The `sorting` option is translated to a `ORDER BY`.

#### Example

Sorting records by `completed` and `title`.

```ts
const records = await this.service.query({
  sorting: [
    {field: 'completed', direction: SortDirection.ASC},
    {field: 'title', direction: SortDirection.DESC},
  ],
});
```

### Paging

The `paging` option is translated to `LIMIT` and `OFFSET`.

#### Example

Skip the first 20 records and return the next 10.

```ts
const records = await this.service.query({
  paging: {limit: 10, offset: 20},
});
```

### Find By Id

To find a single record you can use the `findById` method.

#### Example

```ts
const records = await this.service.findById(1);
```

### Get By Id

The `getById` method is the same as the `findById` with one key difference, it will throw an exception if the record is not found.

#### Example

```ts
try {
  const records = await this.service.getById(1);
} catch (e) {
  console.error('Unable to get record with id = 1');
}
```

## Creating

### Create One

To create a single record use the `createOne` method.

#### Example

```ts
const createdRecord = await this.service.createOne({
  title: 'Foo',
  completed: false,
});
```

### Create Many

To create multiple records use the `createMany` method.

#### Example

```ts
const createdRecords = await this.service.createMany([
  { title: 'Foo', completed: false },
  { title: 'Bar', completed: true },
]);
```

## Updating

### Update One

To update a single record use the `updateOne` method.

#### Example

Updates the record with an id equal to 1 to completed.

```ts
const updatedRecord = await this.service.updateOne(1, { completed: true });
```

### Update Many

To update multiple records use the `updateMany` method.

**NOTE** This method returns a `UpdateManyResponse` which contains the updated record count.

#### Example

Updates all `TodoItemEntities` to completed if their title ends in `Bar`

```ts
const { updatedCount } = await this.service.updateMany(
  {completed: true}, // update
  {completed: {is: false}, title: {like: '%Bar'}} // filter
);
```

## Deleting

### Delete One

To delete a single record use the `deleteOne` method.

#### Example

Delete the record with an id equal to 1.

```ts
const deletedRecord = await this.service.deleteOne(1);
```

### Delete Many

To delete multiple records use the `deleteMany` method.

**NOTE** This method returns a `DeleteManyResponse` which contains the deleted record count.

#### Example

Delete all `TodoItemEntities` older than `Jan 1, 2019`.

```ts
const { deletedCount } = await this.service.deleteMany(
  { created: { lte: new Date('2019-1-1') } } // filter
);
```

## Custom Service

If you want to add custom methods to your service you can extend the `TypeOrmQueryService` directly.

```ts
import { Injectable } from '@nestjs/common';
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
