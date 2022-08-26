<p align="center">
  <a href="https://tripss.github.io/nestjs-query" target="blank"><img src="https://tripss.github.io/nestjs-query/img/logo.svg" width="120" alt="Nestjs-query Logo" /></a>
</p>

[![Test](https://github.com/TriPSs/nestjs-query/actions/workflows/test.yml/badge.svg?branch=master)](https://github.com/TriPSs/nestjs-query/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/TriPSs/nestjs-query/branch/master/graph/badge.svg?token=29EX71ID2P)](https://codecov.io/gh/TriPSs/nestjs-query)
[![Known Vulnerabilities](https://snyk.io/test/github/tripss/nestjs-query/badge.svg?targetFile=package.json)](https://snyk.io/test/github/tripss/nestjs-query?targetFile=package.json)

# nestjs-query

Nestjs-Query is collection of packages to make crud for `graphql` easier.

## Why?

While working on projects in nestjs it was very easy to get up and running with graphql however, there were many patterns that were common between the resolvers. In particular querying, sorting and paging.  

## Installation

[Install Guide](https://tripss.github.io/nestjs-query/docs/introduction/install).

## Docs

* [Getting Started](https://tripss.github.io/nestjs-query/docs/introduction/getting-started)
* [Install Guide](https://tripss.github.io/nestjs-query/docs/introduction/install).
* [Concepts](https://tripss.github.io/nestjs-query/docs/introduction/concepts)
* [Example](https://tripss.github.io/nestjs-query/docs/introduction/example)
* [Typeorm](https://tripss.github.io/nestjs-query/docs/persistence/typeorm/getting-started)
* [Sequelize](https://tripss.github.io/nestjs-query/docs/persistence/sequelize/getting-started)
* [GraphQL](https://tripss.github.io/nestjs-query/docs/graphql/resolvers)

## Packages

Nestjs-query is composed of multiple packages

* [`@ptc-org/nestjs-query-core`](https://github.com/tripss/nestjs-query/tree/master/packages/core) - Defines all interfaces and utility types implemented by the other packages.
* [`@ptc-org/nestjs-query-graphql`](https://github.com/tripss/nestjs-query/tree/master/packages/query-graphql) - Package that provides the graphql resolver and decorators for crud endpoints.
* [`@ptc-org/nestjs-query-mongoose`](https://github.com/tripss/nestjs-query/tree/master/packages/query-typeorm) - Package that implements a Mongoose service that can be used by itself or with the graphql resolver provided by `@ptc-org/nestjs-query-graphql`.
* [`@ptc-org/nestjs-query-sequelize`](https://github.com/tripss/nestjs-query/tree/master/packages/query-sequelize) - Package that implements a Sequelize service that can be used by itself or with the graphql resolver provided by `@ptc-org/nestjs-query-graphql`.
* [`@ptc-org/nestjs-query-typegoose`](https://github.com/tripss/nestjs-query/tree/master/packages/query-typegoose) - Package that implements a Typegoose service that can be used by itself or with the graphql resolver provided by `@ptc-org/nestjs-query-graphql`.
* [`@ptc-org/nestjs-query-typeorm`](https://github.com/tripss/nestjs-query/tree/master/packages/query-typeorm) - Package that implements a Typeorm service that can be used by itself or with the graphql resolver provided by `@ptc-org/nestjs-query-graphql`.

## Development

If you'd like to contribute to this project, all you need to do is clone this project and run:

```bash
$ yarn

# To build all packages
$ yarn nx run-many --target=build --all

# To run all tests
$ yarn nx run-many --target=test --all

# To run the E2E tests
$ docker-compose -f examples/docker-compose.yml up -d
$ yarn nx e2e examples

# To build one package
$ yarn nx build query-graphql
```

## Collaboration

If you have questions or [issues](https://github.com/TriPSs/nestjs-query/issues), please [open an issue](https://github.com/TriPSs/nestjs-query/issues/new)!