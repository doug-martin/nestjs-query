---
id: getting-started
title: Getting Started
sidebar_label: Getting Started
---

## Install 

`@nestjs-query/query-graphql`

```sh
npm i @nestjs-query/query-graphql @nestjs/common @nestjs/graphql graphql graphql-relay class-transformer class-validator reflect-metadata type-graphql
```

`@nestjs-query/query-typeorm`

```sh
npm i @nestjs-query/query-typeorm @nestjs/common class-transformer typeorm
```

**NOTE** `@nestjs-query/query-graphql` and `@nestjs-query/query-typeorm` have opted for peer dependencies to follow nest conventions and to prevent duplicate installations of packages.

## First App

Set up a new nest app following [these instructions](https://docs.nestjs.com/first-steps).



[@nestjs-query/core](core.md)
[@nestjs-query/query-graphql](graphql.md)
[@nestjs-query/query-typeorm](typeorm.md)