---
title: Service 
---

The `TypeormQueryService` is an implementation of the `QueryService` from the `core` package.

All examples assume the following entity

```ts
// todo-item.entity.ts

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

To create a typeorm service extend the `TypeormQueryService`

```ts
import { Injectable } from '@nestjs/common';
import { TypeormQueryService } from '@nestjs-query/query-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TodoItemEntity } from './todo-item.entity';

@Injectable()
export class TodoItemService extends TypeormQueryService<TodoItemEntity> {
  constructor(
    @InjectRepository(TodoItemEntity) repo: Repository<TodoItemEntity>,
  ) {
    super(repo);
  }
}

```

## Querying

To query for records from your service you can use the `query` method which will return a `Promise` of an array of entities. To read more about querying take a look at the [Queries Doc](./query).

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

## Custom Methods

You can also define other methods on your service class that encapsulates your business logic.

```ts
async markAllAsCompleted(): Promise<number> {
   const entities = await this.query({ filter: { completed: { is: true } } });
   
   const { updatedCount } = await this.updateMany(
     { completed: true }, // update
     { id: { in: entities.map(e => e.id) } } // filter
   );
   // do some other business logic
   return updatedCount;
}
```
