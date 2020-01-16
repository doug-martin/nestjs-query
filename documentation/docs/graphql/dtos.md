---
title: DTOs
---

If you have never heard of a DTO before you can read about them [here](https://martinfowler.com/eaaCatalog/dataTransferObject.html)

**NOTE** You can combine your entity and DTO but all examples in the docs have them split to easily show what is
specific to the persistence layer and the web layer.

The `query-graphql` package leverages most decorators from [`@nestjs/graphql`](https://docs.nestjs.com/graphql/quick-start) and [TypeGraphQL](https://typegraphql.ml), with the exception of `FilterableField`.

## `@FilterableField`

The `FilterableField` is very similar to the [`Field`](https://typegraphql.ml/docs/types-and-fields.html) from
TypeGraphQL, however it allows you to specify the fields that should be filterable when querying. 

**NOTE** If you use the TypeGraphQL Field decorator it will not be exposed in the query type for the DTO.

### Example

In the following example we allow `id`, `title`, and `completed` to be used in queries. 

```ts
import { FilterableField } from '@nestjs-query/query-graphql';
import { ObjectType, ID, GraphQLISODateTime, Field } from 'type-graphql';

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


