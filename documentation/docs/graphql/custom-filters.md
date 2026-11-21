---
title: Custom Filters
---

In addition to the built in filters, you can also define custom filtering operations.

There are 2 types of custom filters:

- Global type-based filters, that automatically work on all fields of a given GraphQL type.
- Custom entity-specific filters, that are custom-tailored for DTOs and do not require a specific backing field (more on
  that below).

[//]: # (TODO Add link to page)
:::important

This page describes how to implement custom filters at the GraphQL Level. The persistence layer needs to support them as
well. For now, only TypeOrm is implemented. See here:

- [TypeOrm Custom Filters](/docs/persistence/typeorm/custom-filters)

:::

## Global type-based filters

Type based filters are applied globally to all DTOs, based only on the underlying GraphQL Type.

### Extending the existing filters

Let's assume our persistence layer exposes a `isMultipleOf` filter which allows us to filter numeric fields and choose
only multiples of a user-supplied value. In order to expose that filter on all numeric GraphQL fields, we can do the
following in any typescript file (ideally this should run before the app is initialized):

```ts
import { registerTypeComparison } from '@nestjs-query/query-graphql';
import { IsBoolean, IsInt } from 'class-validator';
import { Float, Int } from '@nestjs/graphql';

registerTypeComparison(Number, 'isMultipleOf', { FilterType: Number, GqlType: Int, decorators: [IsInt()] });
registerTypeComparison(Int, 'isMultipleOf', { FilterType: Number, GqlType: Int, decorators: [IsInt()] });
registerTypeComparison(Float, 'isMultipleOf', { FilterType: Number, GqlType: Int, decorators: [IsInt()] });

// Note, this also works
// registerTypeComparison([Number, Int, Float], 'isMultipleOf', { FilterType: Number, GqlType: Int, decorators: [IsInt()] });
```

Where:

- FilterType is the typescript type of the filter
- GqlType is the GraphQL type that will be used in the schema
- decorators represents a list of decorators that will be applied to the filter class at the specific field used for the
  operation, used e.g. for validation purposes

The above snippet patches the existing Number/Int/Float FieldComparisons so that they expose the new
field/operation `isMultipleOf`. Example:

```graphql
input NumberFieldComparison {
    is: Boolean
    isNot: Boolean
    eq: Float
    neq: Float
    gt: Float
    gte: Float
    lt: Float
    lte: Float
    in: [Float!]
    notIn: [Float!]
    between: NumberFieldComparisonBetween
    notBetween: NumberFieldComparisonBetween
    isMultipleOf: Int
}
```

### Defining a filter on a custom scalar

Let's assume we have a custom scalar, to represent e.g. a geo point (i.e. {lat, lng}):

```ts
@Scalar('Point', (type) => Object)
export class PointScalar implements CustomScalar<any, any> {
  description = 'Point custom scalar type';

  parseValue(value: any): any {
    return { lat: value.lat, lng: value.lng };
  }

  serialize(value: any): any {
    return { lat: value.lat, lng: value.lng };
  }

  parseLiteral(ast: ValueNode): any {
    if (ast.kind === Kind.OBJECT) {
      return ast.fields;
    }
    return null;
  }
}
```

Now, we want to add a radius filter to all Point scalars. A radius filter is a filter that returns all entities whose
location is within a given distance from another point.

First, we need to define the filter type:

```ts
@InputType('RadiusFilter')
export class RadiusFilter {
  @Field(() => Number)
  lat!: number;

  @Field(() => Number)
  lng!: number;

  @Field(() => Number)
  radius!: number;
}
```

Then, we need to register said filter:

```ts
registerTypeComparison(PointScalar, 'distanceFrom', {
  FilterType: RadiusFilter,
  GqlType: RadiusFilter,
});
```

The above snippet creates a new comparison type for the Point scalar and adds the distanceFrom operations to it.
Example:

```graphql
input RadiusFilter {
    lat: Float!
    lng: Float!
    radius: Float!
}

input PointScalarFilterComparison {
    distanceFrom: RadiusFilter
}
```

Now, our persistence layer will be able to receive this new `distanceFrom` key for every property that is represented as
a Point scalar.

:::important

If the shape of the filter at the GraphQL layer is different from what the persistence layer expects, remember to use
an [Assembler and its convertQuery method!](/docs/concepts/advanced/assemblers#converting-the-query)

:::

### Disabling a type-based custom filter on specific fields of a DTO

Global filters are fully compatible with the [allowedComparisons](/docs/graphql/dtos/#example---allowedcomparisons)
option of the `@FilterableField` decorator.

## DTO-based custom filters

These custom filters are explicitly registered on a single DTO field, rather than at the type level. This can be useful
if the persistence layer exposes some specific filters only on some entities (e.g. "Filter all projects who more than 5
pending tasks" where we need to compute the number of pending tasks using a SQL sub-query in the where clause, instead
of having a computed field in the project entity).

:::important

DTO-based custom filters cannot be registered on existing DTO filterable fields, use type-based filters for that!

:::

In order to register a "pending tasks count" filter on our ProjectDto, we can do as follows:

```ts
registerDTOFieldComparison(TestDto, 'pendingTaskCount', 'gt', {
  FilterType: Number,
  GqlType: Int,
  decorators: [IsInt()],
});
```

Where:

- FilterType is the typescript type of the filter
- GqlType is the GraphQL type that will be used in the schema
- decorators represents a list of decorators that will be applied to the filter class at the specific field used for the
  operation, used e.g. for validation purposes

This will add a new operation to the GraphQL `TestDto` input type

```graphql
input TestPendingTaskCountFilterComparison {
  gt: Int
}

input TestDtoFilter {
  """
    ...Other fields defined in TestDTO
  """
  pendingTaskCount: TestPendingTaskCountFilterComparison
}
```

Now, graphQL will accept the new filter and our persistence layer will be able to receive the key `pendingTaskCount` for all filtering operations related to the "TestDto" DTO.
