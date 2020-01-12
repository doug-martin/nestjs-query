---
id: introduction-getting-started
title: Getting Started
sidebar_label: Getting Started
---

Nestjs-Query is collection of packages to make crud for `graphql` (and potentially other transports) easier.

## Why?

While working on projects in nestjs it was very easy to get up and running with typeorm and graphql however, there were many patterns that were common between the resolvers. In particular querying, sorting and paging.  

## Install 

```sh
npm i @nestjs-query/core
```

To add to an existing application.

`@nestjs-query/query-graphql`

```sh
npm i @nestjs-query/query-graphql @nestjs/common @nestjs/graphql graphql graphql-relay class-transformer class-validator reflect-metadata type-graphql
```

`@nestjs-query/query-typeorm`

```sh
npm i @nestjs-query/query-typeorm @nestjs/typeorm @nestjs/common class-transformer typeorm
```

**NOTE** `@nestjs-query/query-graphql` and `@nestjs-query/query-typeorm` have opted for peer dependencies to follow nest conventions and to prevent duplicate installations of packages.

## Packages

Nestjs-query is composed of multiple packages

* [`@nestjs-query/core`](api-core.md) - Defines all interfaces and utility types implemented by the other packages.
* [`@nestjs-query/query-graphql`](api-graphql.md) - Package that provides the graphql resolver and decorators for basic crud methods.
* [`@nestjs-query/query-typeorm`](api-typeorm.md) - Package that implements a Typeorm service that can be used by itself or with the graphql resolver provided by `@nestjs-query/query-graphql`.
