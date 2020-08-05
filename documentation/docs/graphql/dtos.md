---
title: DTOs
---

The `query-graphql` package leverages most decorators from [`@nestjs/graphql`](https://docs.nestjs.com/graphql/quick-start) and [TypeGraphQL](https://typegraphql.ml), with the exception of `FilterableField`.

## `@FilterableField`

The `FilterableField` is very similar to the [`Field`](https://typegraphql.ml/docs/types-and-fields.html) from
TypeGraphQL, however it allows you to specify the fields that should be filterable when querying.

:::note
If you use the @nestjs/graphql `Field` decorator it will not be exposed in the query type for the DTO.
:::

### Options

In addition to the normal field options you can also specify the following options
* `allowedComparisons` - An array of allowed comparisons. You can use this option to allow a subset of filter comparisons when querying through graphql. 
  * This option is useful if the field is expensive to query on for certain operators, or your data source supports a limited set of comparisons.
* `filterRequired` - When set to `true` the field will be required whenever a `filter` is used. The `filter` requirement applies to all `read`, `update`, and `delete` endpoints that use a `filter`.
  * The `filterRequired` option is useful when your entity has an index that requires a subset of fields to be used to provide certain level of query performance.
  * **NOTE**: When a field is a required in a filter the default `filter` option is ignored.   

### Example

In the following example we allow `id`, `title`, and `completed` to be used in queries.

```ts title="todo-item.dto.ts"
import { FilterableField } from '@nestjs-query/query-graphql';
import { ObjectType, ID, GraphQLISODateTime, Field } from '@nestjs/graphql';

@ObjectType('TodoItem')
export class TodoItemDTO {
  @FilterableField(() => ID)
  id!: string;

  @FilterableField()
  title!: string;

  @FilterableField()
  completed!: boolean;

  @Field(() => GraphQLISODateTime)
  created!: Date;

  @Field(() => GraphQLISODateTime)
  updated!: Date;
}

```

### Example - allowedComparisons

In the following example the `allowedComparisons` option is demonstrated by restricting the comparisons that are allowed when filtering on certain fields.

For the `id` field only `eq`, `neq`, `in`, and `notIn` comparisons will be exposed in the schema.

The `title` field will only allow `eq`, `like`, and `notLike`.

```ts title="todo-item.dto.ts" {6,9}
import { FilterableField } from '@nestjs-query/query-graphql';
import { ObjectType, ID, GraphQLISODateTime, Field } from '@nestjs/graphql';

@ObjectType('TodoItem')
export class TodoItemDTO {
  @FilterableField(() => ID, { allowedComparisons: ['eq', 'neq', 'in', 'notIn'] })
  id!: string;

  @FilterableField({ allowedComparisons: ['eq', 'like', 'notLike'] })
  title!: string;

  @FilterableField()
  completed!: boolean;

  @Field(() => GraphQLISODateTime)
  created!: Date;

  @Field(() => GraphQLISODateTime)
  updated!: Date;
}

```

### Example - filterRequired

In the following example the `filterRequired` option is applied to the `completed` field, ensuring that all endpoints that use a filter will require a comparison on the `completed` field.

```ts title="todo-item.dto.ts" {12}
import { FilterableField } from '@nestjs-query/query-graphql';
import { ObjectType, ID, GraphQLISODateTime, Field } from '@nestjs/graphql';

@ObjectType('TodoItem')
export class TodoItemDTO {
  @FilterableField(() => ID)
  id!: string;

  @FilterableField()
  title!: string;

  @FilterableField({ filterRequired: true })
  completed!: boolean;

  @Field(() => GraphQLISODateTime)
  created!: Date;

  @Field(() => GraphQLISODateTime)
  updated!: Date;
}

```
