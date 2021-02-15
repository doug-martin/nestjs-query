---
title: FAQ
---

## The resolver is complaining about my QueryService

If you see an error that contains the following 

```
The types of 'service.query' are incompatible between these types.
```

It means that your entity and DTO are not compatible. 

Typically this indicates that your DTO contains additional fields that your entity does not OR that you have different types for fields. 

To fix:
* Ensure that your entity has the same fields and field types as your DTO.
* If you have fields that should be computed or derived from your entity try using an [Assembler](./concepts/advanced/assemblers.mdx) 

## Do I need a DTO and Entity?

No, you do not! 

For a small project the overhead may not be worth managing both the Entity and DTO especially if they are copies of eachother.

In a larger, longer lived project the initial overhead of creating a DTO in the beginning can pay off if you need to make changes to your persistence layer while keeping changes in your API passive. 

DTOs also provide a clean separation between the fields and relationships that the persistence layer should not know or care about.

:::note
When combining your entity and DTO you should **NOT** decorate your relationships with `@Field` or `@FilterableField`. Instead, add them to your CRUDResolver. [Read More](./persistence/services.mdx#relations) 
:::

## Can I use OFFSET paging instead of a cursor with connections?

Yes! You can specify a `pagingStrategy` option to customize how paging is handled at the resolver or relation level. 

For more information and examples check out the following docs
* [Resolver Paging Strategy](./graphql/resolvers.mdx#paging-strategy)
* [Relations](./graphql/relations.mdx#many-relation)

## Can I use turn off paging?

Yes! You can specify a `pagingStrategy` option to customize how paging is handled at the resolver or relation level. 

For more information and examples check out the following docs
* [Resolver Paging Strategy](./graphql/resolvers.mdx#paging-strategy)
* [Relations](./graphql/relations.mdx#many-relation)


## How can I filter on relations?

You can filter based on relations if you use the `@FilterableRelation` or `@FilterableConnection` decorators when defining your relations.

To read more and see examples read the following docs.

* [`@FilterableRelation`](./graphql/relations.mdx#filterablerelation-decorator)
* [`@FilterableConnection`](./graphql/relations.mdx#filterableconnection-decorator)


## Does nestjs-query support specifying complexity.

Yes! 

The `@FilterableField` decorator accepts the same arguments as the `@Field` decorator from `@nestjs/graphql`

The `@Relation` `@FilterableRelation`, `@AllRelations`, `@FilterableAllRelations`, `@OffsetConnection`, `@FilterableOffsetConnection`, `@CursorConnection`, and `@FilterableCursorConnection` decorators also accept a complexity option.

To read more about complexity [see the nestjs docs](https://docs.nestjs.com/graphql/complexity)

