---
title: Getting Started
---

The `@nestjs-query/query-typeorm` package provides an implementation of `@nestjs-query/core` [QueryService](../concepts/services).

This package is built using [typeorm](https://typeorm.io/#/) and [@nestjs/typeorm](https://docs.nestjs.com/techniques/database#typeorm-integration). If you are unfamiliar with them I suggest you read their documentation first. 

## Installation

```sh
npm i @nestjs-query/query-typeorm @nestjs/typeorm @nestjs/common class-transformer typeorm
```

**NOTE** `@nestjs-query/query-typeorm` have opted for peer dependencies to follow nest conventions and to prevent duplicate installations of packages.

## Docs

* [TypeormQueryService](./services) - Documentation about the `TypeormQueryService` and its usage.
