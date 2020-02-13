---
title: DTOs
---

Throughout the documentation you will read about DTOs (Data Transfer Object). If you have never heard of a DTO before you can read about them [here](https://martinfowler.com/eaaCatalog/dataTransferObject.html)

In the `nestjs-query` packages there are two types of DTOs referenced.

1. Read DTO - The DTO returned from queries and certain mutations, the read DTO does not typically define validation and is used as the basis for querying and filtering.
2. Input DTOs - The DTO used when creating or updating records. The input DTO typically defines user input validation, and a subset of fields from the read DTO that the end user can modify.

To read more about DTOs in graphql check out the [DTO docs in the graphql section](../graphql/dtos).

## Why are DTOs separate from the database entity definition?

**They dont have to be!** 

Often times the overhead of maintaining two classes that mirror each other is not worth the overhead. 

As your application grows you may want to separate them to prevent leaking of certain fields, renaming columns or changing your DB definition while making the change in your API passive.

It is recommended to create an input DTO to make clear what an end user can specify for input and to make your business logic more concise based on the type you are working with.  

