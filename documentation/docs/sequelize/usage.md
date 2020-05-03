---
title: Usage
---

All examples assume the following [model definition](https://github.com/RobinBuschmann/sequelize-typescript#model-definition).

```ts
import {
  Table,
  Column,
  Model,
  AllowNull,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
  AutoIncrement,
} from 'sequelize-typescript';

@Table
export class TodoItemEntity extends Model<TodoItemEntity> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @Column
  title!: string;

  @AllowNull
  @Column
  description?: string;

  @Column
  completed!: boolean;

  @CreatedAt
  created!: Date;

  @UpdatedAt
  updated!: Date;
}


```


## Creating a Service

The `@nestjs-query/query-sequelize` package includes a `@InjectSequelizeQueryService` decorator that creates your `SequelizeQueryService` automatically.

```ts
import { QueryService } from '@nestjs-query/core';
import { CRUDResolver } from '@nestjs-query/query-graphql';
import { Resolver } from '@nestjs/graphql';
import { InjectSequelizeQueryService } from '@nestjs-query/query-sequelize';
import { TodoItemDTO } from './todo-item.dto';
import { TodoItemEntity } from './todo-item.entity';

@Resolver(() => TodoItemDTO)
export class TodoItemResolver extends CRUDResolver(TodoItemDTO) {
  constructor(
    @InjectSequelizeQueryService(TodoItemEntity) readonly service: QueryService<TodoItemEntity>
  ) {
    super(service);
  }
}
```



### Module

In order to use the `@InjectSequelizeQueryService` you will need to use the `NestjsQuerySequelizeModule`.

The `NestjsQuerySequelizeModule` wraps the `@nestjs/sequelize` module and adds the additional decorators.

```ts
import { NestjsQuerySequelizeModule } from '@nestjs-query/query-sequelize';
import { Module } from '@nestjs/common';
import { TodoItemEntity } from './todo-item.entity';
import { TodoItemResolver } from './todo-item.resolver';

@Module({
  providers: [TodoItemResolver],
  imports: [NestjsQuerySequelizeModule.forFeature([TodoItemEntity])],
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

The `filter` option is translated to a `WHERE` clause in `sequelize`.

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

## Foreign Keys

It is a common use case to include a foreign key from your entity in your DTO.

To do this you should add the foreign key to your entity as well as your DTO.

### Example

Assume TodoItems can have SubTasks we would set up our SubTaskEntity using the following

```ts
import {
  Table,
  AllowNull,
  Column,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
  Model,
  AutoIncrement,
  PrimaryKey,
} from 'sequelize-typescript';
import { TodoItemEntity } from '../todo-item/entity/todo-item.entity';

@Table({})
export class SubTaskEntity extends Model<SubTaskEntity> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @Column
  title!: string;

  @AllowNull
  @Column
  description?: string;

  @Column
  completed!: boolean;

  @Column
  @ForeignKey(() => TodoItemEntity)
  todoItemId!: number;

  @BelongsTo(() => TodoItemEntity)
  todoItem!: TodoItemEntity;

  @CreatedAt
  created!: Date;

  @UpdatedAt
  updated!: Date;
}

```

Then we could add the `todoItemId` to the SubTaskDTO.

```ts
import { FilterableField } from '@nestjs-query/query-graphql';
import { ObjectType, ID, GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType('SubTask')
export class SubTaskDTO {
  @FilterableField(() => ID)
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

  // expose the todoItemId as a filterable field.
  @FilterableField()
  todoItemId!: string;
}
```

## Relations

:::note
This section only applies when you combine your DTO and entity
:::

When your DTO and entity are the same class and you have relations defined in `sequelize` you should not decorate your relations with `@Field` or `@FilterableField`. 

Instead specify the relations you want to expose in your resolver.

### Example

Assume you have the following subtask definition.
```ts
import {
  Table,
  AllowNull,
  Column,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
  Model,
  AutoIncrement,
  PrimaryKey,
} from 'sequelize-typescript';
import { FilterableField } from '@nestjs-query/query-graphql';
import { ObjectType, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { TodoItemEntity } from '../todo-item/entity/todo-item.entity';

@ObjectType('SubTask')
@Table
export class SubTaskEntity extends Model<SubTaskEntity> {
  @FilterableField(() => ID)
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @FilterableField()
  @Column
  title!: string;
  
  @FilterableField({ nullable: true })
  @AllowNull
  @Column
  description?: string;
  
  @FilterableField()
  @Column
  completed!: boolean;
  
  @FilterableField()
  @Column
  @ForeignKey(() => TodoItemEntity)
  todoItemId!: number;

  @BelongsTo(() => TodoItemEntity)
  todoItem!: TodoItemEntity;
  
  @FilterableField(() => GraphQLISODateTime)
  @CreatedAt
  created!: Date;

  @FilterableField(() => GraphQLISODateTime)
  @UpdatedAt
  updated!: Date;
}
```
Notice how the `todoItem` is not decorated with a field decorator. 

Instead, add it to your resolver.

```ts
import { QueryService } from '@nestjs-query/core';
import { CRUDResolver } from '@nestjs-query/query-graphql';
import { Resolver } from '@nestjs/graphql';
import { InjectSequelizeQueryService } from '@nestjs-query/query-sequelize';
import { TodoItemEntity } from '../todo-item/todo-item.entity';
import { SubTaskEntity } from './sub-task.entity';

@Resolver(() => SubTaskEntity)
export class SubTaskResolver extends CRUDResolver(SubTaskEntity, {
  relations: {
    one: { todoItem: { DTO: TodoItemEntity, disableRemove: true } },
  },
}) {
  constructor(@InjectSequelizeQueryService(SubTaskEntity) readonly service: QueryService<SubTaskEntity>) {
    super(service);
  }
}

``` 

## Model Serialization

Using `class-transformer` is a popular libarary used in `nestjs`, unfortunately `class-transformer` does not place nicely with `sequelize` models.

For most use cases `nestjs-query` will take care of the serialization for you through [assemblers](../concepts/assemblers). If you find yourself in a situation where you want to use `class-transformer` with a model you should use the following patterns.


To convert your DTO into a model you can use the `build` method on the model.
```ts
TodoItemEntity.build(todoItemDTO);
```

When converting your entity into a DTO you can use the following.

```ts
const dto = plainToClass(TodoItemDTO, todoItemEntity.get({ plain: true }));
```
        

## Custom Service

If you want to add custom methods to your service you can extend the `SequelizeQueryService` directly.

```ts
import { QueryService } from '@nestjs-query/core';
import { InjectModel } from '@nestjs/sequelize';
import { SequelizeQueryService } from '@nestjs-query/query-sequelize';
import { TodoItemEntity } from './entity/todo-item.entity';

@QueryService(TodoItemEntity)
export class TodoItemService extends SequelizeQueryService<TodoItemEntity> {
  constructor(@InjectModel(TodoItemEntity) model: typeof TodoItemEntity) {
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

### Complete Example

To see a complete example checkout https://github.com/doug-martin/nestjs-query/tree/master/examples/nest-graphql-sequelize
