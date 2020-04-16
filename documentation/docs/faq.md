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
* If you have fields that should be computed or derived from your entity try using an [Assembler](./concepts/assemblers) 

