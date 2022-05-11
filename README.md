<p align="center">
  <a href="https://doug-martin.github.io/nestjs-query" target="blank"><img src="https://doug-martin.github.io/nestjs-query/img/logo.svg" width="120" alt="Nestjs-query Logo" /></a>
</p>

[![Test](https://github.com/tripss/nestjs-query/workflows/Test/badge.svg?branch=master)](https://github.com/doug-martin/nestjs-query/actions?query=workflow%3ATest+and+branch%3Amaster+)
[![codecov](https://codecov.io/gh/TriPSs/nestjs-query/branch/master/graph/badge.svg?token=29EX71ID2P)](https://codecov.io/gh/TriPSs/nestjs-query)
[![Known Vulnerabilities](https://snyk.io/test/github/tripss/nestjs-query/badge.svg?targetFile=package.json)](https://snyk.io/test/github/doug-martin/nestjs-query?targetFile=package.json)

# nestjs-query

Nestjs-Query is collection of packages to make crud for `graphql` easier.

## Why?

While working on projects in nestjs it was very easy to get up and running with graphql however, there were many patterns that were common between the resolvers. In particular querying, sorting and paging.  

## Installation

[Install Guide](https://doug-martin.github.io/nestjs-query/docs/introduction/install).

## Docs

* [Getting Started](https://doug-martin.github.io/nestjs-query/docs/introduction/getting-started)
* [Install Guide](https://doug-martin.github.io/nestjs-query/docs/introduction/install).
* [Concepts](https://doug-martin.github.io/nestjs-query/docs/introduction/concepts)
* [Example](https://doug-martin.github.io/nestjs-query/docs/introduction/example)
* [Typeorm](https://doug-martin.github.io/nestjs-query/docs/persistence/typeorm/getting-started)
* [Sequelize](https://doug-martin.github.io/nestjs-query/docs/persistence/sequelize/getting-started)
* [GraphQL](https://doug-martin.github.io/nestjs-query/docs/graphql/resolvers)

## Packages

Nestjs-query is composed of multiple packages

* [`@nestjs-query/core`](https://github.com/doug-martin/nestjs-query/tree/master/packages/core) - Defines all interfaces and utility types implemented by the other packages.
* [`@nestjs-query/query-graphql`](https://github.com/doug-martin/nestjs-query/tree/master/packages/query-graphql) - Package that provides the graphql resolver and decorators for crud endpoints.
* [`@nestjs-query/query-typeorm`](https://github.com/doug-martin/nestjs-query/tree/master/packages/query-typeorm) - Package that implements a Typeorm service that can be used by itself or with the graphql resolver provided by `@nestjs-query/query-graphql`.
* [`@nestjs-query/query-sequelize`](https://github.com/doug-martin/nestjs-query/tree/master/packages/query-sequelize) - Package that implements a Sequelize service that can be used by itself or with the graphql resolver provided by `@nestjs-query/query-graphql`.


