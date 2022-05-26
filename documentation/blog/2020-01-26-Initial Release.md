---
title: Initial Release
author: Doug Martin
author_title: Creator
author_url: https://github.com/tripss
author_image_url: https://avatars1.githubusercontent.com/u/361261?v=4
tags: [nestjs, typeorm, graphql]
---

Initial Release of `nestjs-query`.

`nestjs-query` is collection of packages to make crud for `graphql` (and potentially other transports) easier.

This library is composed of three packages.

* [`@ptc-org/nestjs-query-core`](https://github.com/tripss/nestjs-query/tree/master/packages/core) - Defines all interfaces and utility types implemented by the other packages.
* [`@ptc-org/nestjs-query-graphql`](https://github.com/tripss/nestjs-query/tree/master/packages/graphql) - Package that provides the graphql resolver and decorators for crud endpoints.
* [`@ptc-org/nestjs-query-typeorm`](https://github.com/tripss/nestjs-query/tree/master/packages/typeorm) - Package that implements a Typeorm service that can be used by itself or with the graphql resolver provided by `@ptc-org/nestjs-query-graphql`.

[To read more checkout the docs](https://tripss.github.io/nestjs-query/docs/introduction/getting-started)
