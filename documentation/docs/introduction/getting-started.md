---
title: Getting Started
---

Nestjs-Query is collection of packages to make crud for `graphql` (and potentially other transports) easier.

## Why?

While working on projects in nestjs it was very easy to get up and running with typeorm and graphql however, there were many patterns that were common between the resolvers. In particular querying, sorting and paging.  

## Features

* Built on top of [nestjs](https://nestjs.com/)
* Out of the box [CRUD for GraphQL](../graphql/resolvers) using [TypeORM](https://typeorm.io/)
* Support for one to one, one to many, many to one and many to many [relations](../graphql/relations).
* Built in [dataloader](https://github.com/graphql/dataloader) avoiding the `n+1` problem
* Relay [connections](https://facebook.github.io/relay/graphql/connections.htm) for paging results  

## Install 

Check out the [installation docs](./install.md) 

## Packages

Nestjs-query is composed of multiple packages

* [`@nestjs-query/core`](https://github.com/doug-martin/nestjs-query/tree/master/packages/core) - Defines all interfaces and utility types implemented by the other packages.
* [`@nestjs-query/query-graphql`](https://github.com/doug-martin/nestjs-query/tree/master/packages/query-graphql) - Package that provides the graphql resolver and decorators for crud endpoints.
* [`@nestjs-query/query-typeorm`](https://github.com/doug-martin/nestjs-query/tree/master/packages/query-typeorm) - Package that implements a Typeorm service that can be used by itself or with the graphql resolver provided by `@nestjs-query/query-graphql`.
