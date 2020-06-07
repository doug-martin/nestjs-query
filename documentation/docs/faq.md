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
* If you have fields that should be computed or derived from your entity try using an [Assembler](./concepts/assemblers.mdx) 

## Do I need a DTO and Entity?

No, you do not! 

For a small project the overhead may not be worth managing both the Entity and DTO especially if they are copies of eachother.

In a larger, longer lived project the initial overhead of creating a DTO in the beginning can pay off if you need to make changes to your persistence layer while keeping changes in your API passive. 

DTOs also provide a clean separation between the fields and relationships that the persistence layer should not know or care about.

:::note
When combining your entity and DTO you should **NOT** decorate your relationships with `@Field` or `@FilterableField`. Instead, add them to your CRUDResolver. [Read More](./persistence/services#relations) 
:::
