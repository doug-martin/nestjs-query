---
title: Initial Release
author: Doug Martin
author_title: Creator
author_url: https://github.com/doug-martin
author_image_url: https://avatars1.githubusercontent.com/u/361261?v=4
tags: [nestjs, typeorm, graphql]
---

Initial Release of `nestjs-query`.

`nestjs-query` is collection of packages to make crud for `graphql` (and potentially other transports) easier.

This library is composed of three packages.

- [`@codeshine/nestjs-query-core`](https://github.com/doug-martin/nestjs-query/tree/master/packages/core) - Defines all interfaces and utility types implemented by the other packages.
- [`@codeshine/nestjs-query-graphql`](https://github.com/doug-martin/nestjs-query/tree/master/packages/graphql) - Package that provides the graphql resolver and decorators for crud endpoints.
- [`@codeshine/nestjs-query-typeorm`](https://github.com/doug-martin/nestjs-query/tree/master/packages/typeorm) - Package that implements a Typeorm service that can be used by itself or with the graphql resolver provided by `@codeshine/nestjs-query-graphql`.

[To read more checkout the docs](https://doug-martin.github.io/nestjs-query/docs/introduction/getting-started)
