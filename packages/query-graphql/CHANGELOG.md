# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.30.0](https://github.com/doug-martin/nestjs-query/compare/v0.29.0...v0.30.0) (2021-09-30)


### Bug Fixes

* **deps:** update apollo graphql packages ([6d40b9d](https://github.com/doug-martin/nestjs-query/commit/6d40b9d10de522d7950fca8279ee2d763c17e3a5))
* **query-graphql:** Custom authorizers now behave like auth decorators ([ff92b9a](https://github.com/doug-martin/nestjs-query/commit/ff92b9ae7a0ae4fb9585bead9b778e26fbd6b95a))
* **query-graphql:** fix eslint errors ([73acbc3](https://github.com/doug-martin/nestjs-query/commit/73acbc3557d3e8cccbe7cb7e8e01dde9d4218208))





# [0.29.0](https://github.com/doug-martin/nestjs-query/compare/v0.28.1...v0.29.0) (2021-09-09)


### Bug Fixes

* **query-graphql:** adapt createFromPromise typings and add tests for passing additional query params ([d81e531](https://github.com/doug-martin/nestjs-query/commit/d81e5315cbc6e2d665256fd6dcfa09689cadd2b1))
* **query-graphql:** pass original query in keyset pager strategy ([07f9e7b](https://github.com/doug-martin/nestjs-query/commit/07f9e7b78cccc788c772776a4ced336eec016164))


### Features

* **graphql:** propagate correct query types throughout paging ([348044f](https://github.com/doug-martin/nestjs-query/commit/348044f8509d8aef21e4a5f55b93bd28793b0fcc))





## [0.28.1](https://github.com/doug-martin/nestjs-query/compare/v0.28.0...v0.28.1) (2021-07-27)


### Features

* **graphql,#958,#1160:** Enable authorizers on subscriptions ([d2f857f](https://github.com/doug-martin/nestjs-query/commit/d2f857f73540ee400f5dcc79cbb25dfba81c2963)), closes [#958](https://github.com/doug-martin/nestjs-query/issues/958) [#1160](https://github.com/doug-martin/nestjs-query/issues/1160)





# [0.28.0](https://github.com/doug-martin/nestjs-query/compare/v0.27.0...v0.28.0) (2021-07-19)


### Bug Fixes

* NestjsQueryGraphqlModuleOpts ([984f591](https://github.com/doug-martin/nestjs-query/commit/984f5917db5971a336054186f8a7fddc522745cc))





# [0.27.0](https://github.com/doug-martin/nestjs-query/compare/v0.26.0...v0.27.0) (2021-05-12)


### Features

* **graphql,#1058:** Allow declaration of custom ID scalar type ([fb2ed7a](https://github.com/doug-martin/nestjs-query/commit/fb2ed7aca59d66fa8827522cf81b6e31e77161d3)), closes [#1058](https://github.com/doug-martin/nestjs-query/issues/1058)





# [0.26.0](https://github.com/doug-martin/nestjs-query/compare/v0.25.1...v0.26.0) (2021-04-13)


### Bug Fixes

* **graphql,auth,#1026:** Fixed auth context on deleteMany ([3d4efd4](https://github.com/doug-martin/nestjs-query/commit/3d4efd44fae7e2ee119e53884519e5b2700e9e72))
* **graphql,auth,#1026:** Fixed renamed export ([24b1193](https://github.com/doug-martin/nestjs-query/commit/24b11936014312d435b0d7f17c4237fd48c5dc52))
* **graphql,federation,#1051:** check for undefined as well ([298150a](https://github.com/doug-martin/nestjs-query/commit/298150a73571e08b9d4c3d24278a24b8aec8e62b)), closes [#1051](https://github.com/doug-martin/nestjs-query/issues/1051)
* **graphql,federation,#1051:** return null for references ([6cb832e](https://github.com/doug-martin/nestjs-query/commit/6cb832ebe03c4b4cc1ec133e93a39c4637c87685)), closes [#1051](https://github.com/doug-martin/nestjs-query/issues/1051)


### Features

* **graphql:** Expose setRelations mutation ([676a4d5](https://github.com/doug-martin/nestjs-query/commit/676a4d5fc16717ae10c8f9f8e71550f1a42d6b2e))
* **graphql,#1048:** added filter-only option to filterable fields ([55cb010](https://github.com/doug-martin/nestjs-query/commit/55cb0105a11224db1e61023762f030d5c2dae6bc)), closes [#1048](https://github.com/doug-martin/nestjs-query/issues/1048)
* **graphql,auth:** Pass operation name to authorizer [#1026](https://github.com/doug-martin/nestjs-query/issues/1026) ([4343821](https://github.com/doug-martin/nestjs-query/commit/43438218d286791059a7a5f8eb40110320bdcfca))
* **graphql,auth,#1026:** Added convenience fields to auth context ([32df50e](https://github.com/doug-martin/nestjs-query/commit/32df50e502483bd3492a2d3481786d8931556438)), closes [#1026](https://github.com/doug-martin/nestjs-query/issues/1026)
* **graphql,auth,#1026:** Enable authorization on create methods as well ([4c7905e](https://github.com/doug-martin/nestjs-query/commit/4c7905e2c96bf3aab1841091d44599b917ecdd56)), closes [#1026](https://github.com/doug-martin/nestjs-query/issues/1026)





## [0.25.1](https://github.com/doug-martin/nestjs-query/compare/v0.25.0...v0.25.1) (2021-04-07)

**Note:** Version bump only for package @nestjs-query/query-graphql





# [0.25.0](https://github.com/doug-martin/nestjs-query/compare/v0.24.5...v0.25.0) (2021-03-31)


### Features

* **graphql:** Add new aggregate groupBy ([922e696](https://github.com/doug-martin/nestjs-query/commit/922e696df1c56d5d0181cbb769ffbfba943157dd))





## [0.24.5](https://github.com/doug-martin/nestjs-query/compare/v0.24.4...v0.24.5) (2021-03-19)

**Note:** Version bump only for package @nestjs-query/query-graphql





## [0.24.4](https://github.com/doug-martin/nestjs-query/compare/v0.24.3...v0.24.4) (2021-03-18)

**Note:** Version bump only for package @nestjs-query/query-graphql





## [0.24.3](https://github.com/doug-martin/nestjs-query/compare/v0.24.2...v0.24.3) (2021-03-17)


### Features

* **graphql,#609:** Allow disabling maxResultSize ([a3cd664](https://github.com/doug-martin/nestjs-query/commit/a3cd664eb3cd2ebf81a110b7218fb69d4b4a3955)), closes [#609](https://github.com/doug-martin/nestjs-query/issues/609)





## [0.24.2](https://github.com/doug-martin/nestjs-query/compare/v0.24.1...v0.24.2) (2021-03-17)


### Bug Fixes

* **graphql,hooks,#957:** Fix HookInterceptor not working with custom resolvers ([c947b3a](https://github.com/doug-martin/nestjs-query/commit/c947b3a509d9ba12310680baf8382d8ec7116fd7))





# [0.24.0](https://github.com/doug-martin/nestjs-query/compare/v0.23.1...v0.24.0) (2021-03-15)


### Features

* **graphql:** Allow disabling `and`/`or` filters ([c20fdbd](https://github.com/doug-martin/nestjs-query/commit/c20fdbd9774a541cf4ada8df1c5981e12ede7e8d))
* **typegoose:** Add typegoose package ([#846](https://github.com/doug-martin/nestjs-query/issues/846)) ([73cf5cd](https://github.com/doug-martin/nestjs-query/commit/73cf5cdbf11496ad3a3ce3f6bb69975510de26e2))





# [0.23.0](https://github.com/doug-martin/nestjs-query/compare/v0.22.0...v0.23.0) (2021-02-26)


### Features

* **graphql:** Added new offset connection with totalCount ([2780e7e](https://github.com/doug-martin/nestjs-query/commit/2780e7ebfefbcee010797b244fcb46a182a4102e))
* **graphql:** Enabling registering DTOs without auto-generating a resolver ([2f18142](https://github.com/doug-martin/nestjs-query/commit/2f18142edf5a0dc0563099b532d54f4a44ac7e56))
* **graphql,hooks:** Provide support for injectable hooks ([d100de8](https://github.com/doug-martin/nestjs-query/commit/d100de8306113c044bcbbdc0ceb373c977354255))
* **graphql,relations:** Revert back to unPagedRelation ([cb3dc62](https://github.com/doug-martin/nestjs-query/commit/cb3dc624328077267eded288f7cfbd5a6e9b7806))





# [0.22.0](https://github.com/doug-martin/nestjs-query/compare/v0.21.2...v0.22.0) (2021-02-08)

**Note:** Version bump only for package @nestjs-query/query-graphql





## [0.21.2](https://github.com/doug-martin/nestjs-query/compare/v0.21.1...v0.21.2) (2020-10-23)


### Bug Fixes

* dataloader cacheKeyFn bigint problem ([92171dc](https://github.com/doug-martin/nestjs-query/commit/92171dcc76563c563e2586809aec6f12f00aadfa))





## [0.21.1](https://github.com/doug-martin/nestjs-query/compare/v0.21.0...v0.21.1) (2020-10-18)


### Features

* **graphql, #586:** Allow overriding endpoint name ([1634e71](https://github.com/doug-martin/nestjs-query/commit/1634e71e7d8eca5b3a2422b7514fea8c2f72220e)), closes [#586](https://github.com/doug-martin/nestjs-query/issues/586)





# [0.21.0](https://github.com/doug-martin/nestjs-query/compare/v0.20.2...v0.21.0) (2020-10-16)


### Bug Fixes

* **eslint:** Fix eslint to recognize sub packages ([13fdd2b](https://github.com/doug-martin/nestjs-query/commit/13fdd2b31289dbc80316cbdb5aa32edbe596bad4))





## [0.20.2](https://github.com/doug-martin/nestjs-query/compare/v0.20.1...v0.20.2) (2020-10-01)

**Note:** Version bump only for package @nestjs-query/query-graphql





## [0.20.1](https://github.com/doug-martin/nestjs-query/compare/v0.20.0...v0.20.1) (2020-09-28)


### Bug Fixes

* **graphql:** Fix assemblers type for module passthrough ([713c41c](https://github.com/doug-martin/nestjs-query/commit/713c41cd770068f2242a380593e4a22601d6560b))





# [0.20.0](https://github.com/doug-martin/nestjs-query/compare/v0.19.4...v0.20.0) (2020-09-17)


### Features

* **core:** Update assemblers to allow transforming create/update dtos ([5085d11](https://github.com/doug-martin/nestjs-query/commit/5085d1193a84396c9016821347c04f0e15eb04da))





## [0.19.4](https://github.com/doug-martin/nestjs-query/compare/v0.19.3...v0.19.4) (2020-09-15)


### Features

* **graphql:** Add keyset connections ([36bdbdd](https://github.com/doug-martin/nestjs-query/commit/36bdbdd9fda8b1db531ceb65c3a7c604c3da23fe))





## [0.19.3](https://github.com/doug-martin/nestjs-query/compare/v0.19.2...v0.19.3) (2020-09-09)


### Bug Fixes

* **graphql,hooks:** Allow getting hooks from parent classes ([59a0aeb](https://github.com/doug-martin/nestjs-query/commit/59a0aebc3dabd7d23ffde576a94bc588e768efbe))





## [0.19.2](https://github.com/doug-martin/nestjs-query/compare/v0.19.1...v0.19.2) (2020-09-03)


### Bug Fixes

* **graphql, #505:** Less restrictive readResolverOpts for auto crud ([b4e6862](https://github.com/doug-martin/nestjs-query/commit/b4e68620a973caf4a6bc9ddc9947c0be7464fb11)), closes [#505](https://github.com/doug-martin/nestjs-query/issues/505)





# [0.19.0](https://github.com/doug-martin/nestjs-query/compare/v0.18.1...v0.19.0) (2020-09-01)


### Features

* **graphql,auth:** Add authorization to resolvers and relations ([9d76787](https://github.com/doug-martin/nestjs-query/commit/9d76787d031e6a731f28877c0df46cf4472b2faf))





## [0.18.1](https://github.com/doug-martin/nestjs-query/compare/v0.18.0...v0.18.1) (2020-08-14)

**Note:** Version bump only for package @nestjs-query/query-graphql





# [0.18.0](https://github.com/doug-martin/nestjs-query/compare/v0.17.10...v0.18.0) (2020-08-11)

**Note:** Version bump only for package @nestjs-query/query-graphql





## [0.17.10](https://github.com/doug-martin/nestjs-query/compare/v0.17.9...v0.17.10) (2020-08-01)

**Note:** Version bump only for package @nestjs-query/query-graphql





## [0.17.9](https://github.com/doug-martin/nestjs-query/compare/v0.17.8...v0.17.9) (2020-07-29)


### Features

* **graphql:** Allow specifying fields that are required when querying ([a425ba7](https://github.com/doug-martin/nestjs-query/commit/a425ba73b0fc5a184db5b10a709ed78fd234ba7a))





## [0.17.8](https://github.com/doug-martin/nestjs-query/compare/v0.17.7...v0.17.8) (2020-07-28)


### Features

* **graphql:** Allow specifying allowed comparisons on filterable fields ([ced2792](https://github.com/doug-martin/nestjs-query/commit/ced27920e5c2278c2a04c027a692e25b3306f6cb))





## [0.17.7](https://github.com/doug-martin/nestjs-query/compare/v0.17.6...v0.17.7) (2020-07-27)

**Note:** Version bump only for package @nestjs-query/query-graphql





## [0.17.6](https://github.com/doug-martin/nestjs-query/compare/v0.17.5...v0.17.6) (2020-07-24)


### Bug Fixes

* **graphql:** Include inherited references and relations ([26dd6f9](https://github.com/doug-martin/nestjs-query/commit/26dd6f972379cad736f483912c7a2cf44d0ba966))





## [0.17.5](https://github.com/doug-martin/nestjs-query/compare/v0.17.4...v0.17.5) (2020-07-24)


### Bug Fixes

* **graphql,aggregations:** Exclude __typename in aggregations ([3897673](https://github.com/doug-martin/nestjs-query/commit/3897673681b30425debc329ad5d5bb442b3838fe))





## [0.17.4](https://github.com/doug-martin/nestjs-query/compare/v0.17.3...v0.17.4) (2020-07-23)


### Features

* **graphql,hooks:** Add before hooks to graphql mutations ([3448955](https://github.com/doug-martin/nestjs-query/commit/3448955331ae24f3b08c1d8b459b13e0ae96c79f))





## [0.17.3](https://github.com/doug-martin/nestjs-query/compare/v0.17.2...v0.17.3) (2020-07-17)


### Bug Fixes

* **graphql:** Fix filters to transform to expected type [#317](https://github.com/doug-martin/nestjs-query/issues/317) ([0d28b0b](https://github.com/doug-martin/nestjs-query/commit/0d28b0b968468f821e9b6cf7d53e6d95af22e710))





## [0.17.2](https://github.com/doug-martin/nestjs-query/compare/v0.17.1...v0.17.2) (2020-07-17)

**Note:** Version bump only for package @nestjs-query/query-graphql





## [0.17.1](https://github.com/doug-martin/nestjs-query/compare/v0.17.0...v0.17.1) (2020-07-17)


### Features

* **complexity:** Add complexity support for relations ([aa85325](https://github.com/doug-martin/nestjs-query/commit/aa853257e693cc656d6ef00d08d547f1988f16c5))





# [0.17.0](https://github.com/doug-martin/nestjs-query/compare/v0.16.2...v0.17.0) (2020-07-16)


### Features

* **aggregations:** Add aggregations to graphql ([af075d2](https://github.com/doug-martin/nestjs-query/commit/af075d2e93b6abbbfbe32afcc917350f803fadaa))
* **aggregations,relations:** Add relation aggregation graphql enpoints ([56bb7e0](https://github.com/doug-martin/nestjs-query/commit/56bb7e0be3298ebe76159327ce54229818a6067b))





## [0.16.2](https://github.com/doug-martin/nestjs-query/compare/v0.16.1...v0.16.2) (2020-07-09)


### Bug Fixes

* **imports:** Remove additional /src references ([9528772](https://github.com/doug-martin/nestjs-query/commit/9528772fd4f9b4448112d912e913d07fddf4b619))





## [0.16.1](https://github.com/doug-martin/nestjs-query/compare/v0.16.0...v0.16.1) (2020-07-07)

**Note:** Version bump only for package @nestjs-query/query-graphql





# [0.16.0](https://github.com/doug-martin/nestjs-query/compare/v0.15.1...v0.16.0) (2020-07-05)


### Features

* **graphql:** Enable filtering on ORM relations ([60229b8](https://github.com/doug-martin/nestjs-query/commit/60229b8fe981a863e8f31f1734c0b9a1aa001cf2))





## [0.15.1](https://github.com/doug-martin/nestjs-query/compare/v0.15.0...v0.15.1) (2020-06-27)

**Note:** Version bump only for package @nestjs-query/query-graphql





# [0.15.0](https://github.com/doug-martin/nestjs-query/compare/v0.14.3...v0.15.0) (2020-06-23)


### Features

* **graphql,connection:** Add totalCount to connections ([ed1e84a](https://github.com/doug-martin/nestjs-query/commit/ed1e84a2feb6f89c3b270fcbc1d0eaf6aec5e575))





## [0.14.3](https://github.com/doug-martin/nestjs-query/compare/v0.14.2...v0.14.3) (2020-06-20)


### Bug Fixes

* **graphql,subscriptions:** Expose InjectPubSub decorator ([867022e](https://github.com/doug-martin/nestjs-query/commit/867022e1967e63659b5df24b13eb04c829569372))





## [0.14.1](https://github.com/doug-martin/nestjs-query/compare/v0.14.0...v0.14.1) (2020-06-19)


### Bug Fixes

* **graphql:** Allow custom scalars for comparisons ([57cbe38](https://github.com/doug-martin/nestjs-query/commit/57cbe38cdd941bafab75a660803be6ae5c0afb2c))





# [0.14.0](https://github.com/doug-martin/nestjs-query/compare/v0.13.2...v0.14.0) (2020-06-18)


### Features

* **graphql,paging:** Add NONE paging strategy ([216d926](https://github.com/doug-martin/nestjs-query/commit/216d926a11bb7f4929fe9394c04af826cd3fa52f))





## [0.13.2](https://github.com/doug-martin/nestjs-query/compare/v0.13.1...v0.13.2) (2020-06-14)


### Bug Fixes

* **graphl,filters:** Allow for enums when filtering ([60dcc30](https://github.com/doug-martin/nestjs-query/commit/60dcc3074b36a2aeffbf4e30b04d0af3631ae02a))





## [0.13.1](https://github.com/doug-martin/nestjs-query/compare/v0.13.0...v0.13.1) (2020-06-12)


### Bug Fixes

* **graphql,paging:** Fix for [#281](https://github.com/doug-martin/nestjs-query/issues/281) paging backwards windowing ([c319344](https://github.com/doug-martin/nestjs-query/commit/c3193440504f55ef8b8b08b486ae01c1b54595bc))





# [0.13.0](https://github.com/doug-martin/nestjs-query/compare/v0.12.0...v0.13.0) (2020-06-12)


### Features

* **graphql:** Add limit offset paging without connections ([5fc3e90](https://github.com/doug-martin/nestjs-query/commit/5fc3e90c0c738cc653eab57eb0be3c98dae51c3e))





# [0.12.0](https://github.com/doug-martin/nestjs-query/compare/v0.11.8...v0.12.0) (2020-06-07)


### Features

* **graphql:** Add graphql subscriptions ([5dc987f](https://github.com/doug-martin/nestjs-query/commit/5dc987f435e0680192313e208359839f9c21d70b))





## [0.11.8](https://github.com/doug-martin/nestjs-query/compare/v0.11.7...v0.11.8) (2020-05-30)

**Note:** Version bump only for package @nestjs-query/query-graphql





## [0.11.7](https://github.com/doug-martin/nestjs-query/compare/v0.11.6...v0.11.7) (2020-05-29)

**Note:** Version bump only for package @nestjs-query/query-graphql





## [0.11.6](https://github.com/doug-martin/nestjs-query/compare/v0.11.5...v0.11.6) (2020-05-26)

**Note:** Version bump only for package @nestjs-query/query-graphql





## [0.11.5](https://github.com/doug-martin/nestjs-query/compare/v0.11.4...v0.11.5) (2020-05-21)

**Note:** Version bump only for package @nestjs-query/query-graphql





## [0.11.4](https://github.com/doug-martin/nestjs-query/compare/v0.11.3...v0.11.4) (2020-05-19)

**Note:** Version bump only for package @nestjs-query/query-graphql





## [0.11.3](https://github.com/doug-martin/nestjs-query/compare/v0.11.2...v0.11.3) (2020-05-16)

**Note:** Version bump only for package @nestjs-query/query-graphql





## [0.11.2](https://github.com/doug-martin/nestjs-query/compare/v0.11.1...v0.11.2) (2020-05-14)


### Bug Fixes

* Fix lint issues ([c3407c0](https://github.com/doug-martin/nestjs-query/commit/c3407c0abfebe2ed6563cf754bab646af124a661))


### Features

* **graphql,core:** Add support for custom services and assemblers ([85e8658](https://github.com/doug-martin/nestjs-query/commit/85e8658c6acd495233cabb576c3458afcb8fff12))





## [0.11.1](https://github.com/doug-martin/nestjs-query/compare/v0.11.0...v0.11.1) (2020-05-11)


### Features

* **graphql:** Add support for auto-generated federations ([238f641](https://github.com/doug-martin/nestjs-query/commit/238f641967ea6668dfb7bd9034fec732da7fe38b))





# [0.11.0](https://github.com/doug-martin/nestjs-query/compare/v0.10.2...v0.11.0) (2020-05-09)


### Features

* **graphql:** Add graphql module ([282c421](https://github.com/doug-martin/nestjs-query/commit/282c421d0e6f67fe750fa6005f6cb7d960c8fbd0))
* **graphql:** Add relation/connection decorators ([a75cf96](https://github.com/doug-martin/nestjs-query/commit/a75cf96c18dcc3fb1f8899933959753f66b68d7e))





## [0.10.1](https://github.com/doug-martin/nestjs-query/compare/v0.10.0...v0.10.1) (2020-05-02)


### Bug Fixes

* **graphql:** Fix paging to properly check next/previous page ([13c7bd9](https://github.com/doug-martin/nestjs-query/commit/13c7bd90dae9e5d6ffd33a8813b2cdfcc75ae131))





# [0.10.0](https://github.com/doug-martin/nestjs-query/compare/v0.9.0...v0.10.0) (2020-04-29)


### Features

* **sequelize:** Initial Sequelize support ([bfcf436](https://github.com/doug-martin/nestjs-query/commit/bfcf4368b96617113c0334cd78a8881e4952eb99))





# [0.9.0](https://github.com/doug-martin/nestjs-query/compare/v0.8.9...v0.9.0) (2020-04-26)

**Note:** Version bump only for package @nestjs-query/query-graphql





## [0.8.9](https://github.com/doug-martin/nestjs-query/compare/v0.8.8...v0.8.9) (2020-04-24)

**Note:** Version bump only for package @nestjs-query/query-graphql





## [0.8.8](https://github.com/doug-martin/nestjs-query/compare/v0.8.7...v0.8.8) (2020-04-23)

**Note:** Version bump only for package @nestjs-query/query-graphql





## [0.8.7](https://github.com/doug-martin/nestjs-query/compare/v0.8.6...v0.8.7) (2020-04-23)

**Note:** Version bump only for package @nestjs-query/query-graphql
