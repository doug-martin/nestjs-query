---
title: Getting Started
---

Nestjs-Query is collection of packages to make crud for `graphql` (and potentially other transports) easier.

## Why?

While working on projects in nestjs it was very easy to get up and running with typeorm and graphql however, there were many patterns that were common between the resolvers. In particular querying, sorting and paging.  

## Features

* Built on top of [nestjs](https://nestjs.com/)
* Out of the box [CRUD for GraphQL](../graphql/resolvers.mdx) using [TypeORM](https://typeorm.io/), [Sequelize](https://sequelize.org/) or [Mongoose](https://mongoosejs.com/)
* [Aggregate Queries](../graphql/aggregations.mdx) on objects and their relations.
* Out of the box [subscriptions](../graphql/subscriptions.mdx) on all `CRUD` operations.
* Support for one to one, one to many, many to one and many to many [relations](../graphql/relations.mdx).
* Built in [dataloader](https://github.com/graphql/dataloader) avoiding the `n+1` problem
* Relay [connections](https://facebook.github.io/relay/graphql/connections.htm) for paging results  

## Install

Check out the [installation docs](./install.md)

## Packages

Nestjs-query is composed of multiple packages

* [`@nestjs-query/core`](https://github.com/doug-martin/nestjs-query/tree/master/packages/core) - Defines all interfaces and utility types implemented by the other packages.
* [`@nestjs-query/query-graphql`](https://github.com/doug-martin/nestjs-query/tree/master/packages/query-graphql) - Package that provides the graphql resolver and decorators for crud endpoints.
* [`@nestjs-query/query-typeorm`](https://github.com/doug-martin/nestjs-query/tree/master/packages/query-typeorm) - Package that implements a Typeorm service that can be used by itself or with the graphql resolver provided by `@nestjs-query/query-graphql`.
* [`@nestjs-query/query-sequelize`](https://github.com/doug-martin/nestjs-query/tree/master/packages/query-sequelize) - Package that implements a Sequelize service that can be used by itself or with the graphql resolver provided by `@nestjs-query/query-graphql`.
* [`@nestjs-query/query-mongoose`](https://github.com/doug-martin/nestjs-query/tree/master/packages/query-mongoose) - Package that implements a Mongoose service that can be used by itself or with the graphql resolver provided by `@nestjs-query/query-graphql`.

## Migration Guides

* [`v0.22.x` to `v0.23.x`](../migration-guides/v0.22.x-to-v0.23.x.mdx)
* [`v0.15.x` to `v0.16.x`](../migration-guides/v0.15.x-to-v0.16.x.mdx)
* [`v0.14.x` to `v0.15.x`](../migration-guides/v0.14.x-to-v0.15.x.mdx)
* [`v0.13.x` to `v0.14.x`](../migration-guides/v0.13.x-to-v0.14.x.md)
* [`v0.12.x` to `v0.13.x`](../migration-guides/v0.12.x-to-v0.13.x.md)
* [`v0.10.x` to `v0.11.x`](../migration-guides/v0.10.x-to-v0.11.x.mdx)
* [`v0.5.x` to `v0.6.x`](../migration-guides/v0.5.x-to-v0.6.x.md)

