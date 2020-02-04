---
title: Getting Started
---

The `@nestjs-query/query-graphql` package provided base `Resolvers` and graphql type classes to make creating code-first graphql CRUD applications easy.

## Installation

```sh
npm i  @nestjs-query/query-graphql @nestjs-query/core @nestjs/common @nestjs/graphql graphql graphql-relay class-transformer class-validator reflect-metadata type-graphql
```

**NOTE** `@nestjs-query/query-graphql` have opted for peer dependencies to follow nest conventions and to prevent duplicate installations of packages.

### Docs

* [DTOs](./dtos) - Documentation about the use of DTOs and associated annotations.
* [Resolvers](./resolvers) - Documentation about crud resolvers and their usage.
* [Queries](./queries) - Documentation about the provided graphql query endpoints.
* [Mutations](./mutations) -  Documentation about the provided graphql mutation endpoints.
* [Relations](./relations) -  Documentation about specifying relations in your resolvers.
* [Types](./types) - Documentation for the provided graphql types.
