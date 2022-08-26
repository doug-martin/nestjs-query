 
# 1.0.0-alpha.0 (2022-08-26)


### Bug Fixes

* BREAKING change input to id for DELETE ONE ([d8b6e68](https://github.com/TriPSs/nestjs-query/commit/d8b6e689b83a848aaca3757b5be9e47a17ceee0b))
* dataloader cacheKeyFn bigint problem ([92171dc](https://github.com/TriPSs/nestjs-query/commit/92171dcc76563c563e2586809aec6f12f00aadfa))
* **deps:** pin dependencies ([93e9f66](https://github.com/TriPSs/nestjs-query/commit/93e9f664d21e05ed1adc35f1bfafcb6acfe8e536))
* **deps:** update apollo graphql packages ([6d40b9d](https://github.com/TriPSs/nestjs-query/commit/6d40b9d10de522d7950fca8279ee2d763c17e3a5))
* **eslint:** Fix eslint to recognize sub packages ([13fdd2b](https://github.com/TriPSs/nestjs-query/commit/13fdd2b31289dbc80316cbdb5aa32edbe596bad4))
* Fix lint issues ([c3407c0](https://github.com/TriPSs/nestjs-query/commit/c3407c0abfebe2ed6563cf754bab646af124a661))
* Fixed almost all tests ([f614f04](https://github.com/TriPSs/nestjs-query/commit/f614f04e4e75c87c3e72b1c30eb7899d3770a7c1))
* **graphl,filters:** Allow for enums when filtering ([60dcc30](https://github.com/TriPSs/nestjs-query/commit/60dcc3074b36a2aeffbf4e30b04d0af3631ae02a))
* **graphql, #505:** Less restrictive readResolverOpts for auto crud ([b4e6862](https://github.com/TriPSs/nestjs-query/commit/b4e68620a973caf4a6bc9ddc9947c0be7464fb11)), closes [#505](https://github.com/TriPSs/nestjs-query/issues/505)
* **graphql,aggregations:** Exclude __typename in aggregations ([3897673](https://github.com/TriPSs/nestjs-query/commit/3897673681b30425debc329ad5d5bb442b3838fe))
* **graphql,auth,#1026:** Fixed auth context on deleteMany ([3d4efd4](https://github.com/TriPSs/nestjs-query/commit/3d4efd44fae7e2ee119e53884519e5b2700e9e72))
* **graphql,auth,#1026:** Fixed renamed export ([24b1193](https://github.com/TriPSs/nestjs-query/commit/24b11936014312d435b0d7f17c4237fd48c5dc52))
* **graphql,federation,#1051:** check for undefined as well ([298150a](https://github.com/TriPSs/nestjs-query/commit/298150a73571e08b9d4c3d24278a24b8aec8e62b)), closes [#1051](https://github.com/TriPSs/nestjs-query/issues/1051)
* **graphql,federation,#1051:** return null for references ([6cb832e](https://github.com/TriPSs/nestjs-query/commit/6cb832ebe03c4b4cc1ec133e93a39c4637c87685)), closes [#1051](https://github.com/TriPSs/nestjs-query/issues/1051)
* **graphql,hooks,#957:** Fix HookInterceptor not working with custom resolvers ([c947b3a](https://github.com/TriPSs/nestjs-query/commit/c947b3a509d9ba12310680baf8382d8ec7116fd7))
* **graphql,hooks:** Allow getting hooks from parent classes ([59a0aeb](https://github.com/TriPSs/nestjs-query/commit/59a0aebc3dabd7d23ffde576a94bc588e768efbe))
* **graphql,paging:** Fix for [#281](https://github.com/TriPSs/nestjs-query/issues/281) paging backwards windowing ([c319344](https://github.com/TriPSs/nestjs-query/commit/c3193440504f55ef8b8b08b486ae01c1b54595bc))
* **graphql,subscriptions:** Expose InjectPubSub decorator ([867022e](https://github.com/TriPSs/nestjs-query/commit/867022e1967e63659b5df24b13eb04c829569372))
* **graphql:** Add support for extending abstract object types [#82](https://github.com/TriPSs/nestjs-query/issues/82) ([5151ceb](https://github.com/TriPSs/nestjs-query/commit/5151ceb08e05a435be4f367f6f6f03568bc72a27))
* **graphql:** Allow custom scalars for comparisons ([57cbe38](https://github.com/TriPSs/nestjs-query/commit/57cbe38cdd941bafab75a660803be6ae5c0afb2c))
* **graphql:** Fix assemblers type for module passthrough ([713c41c](https://github.com/TriPSs/nestjs-query/commit/713c41cd770068f2242a380593e4a22601d6560b))
* **graphql:** Fix filters to transform to expected type [#317](https://github.com/TriPSs/nestjs-query/issues/317) ([0d28b0b](https://github.com/TriPSs/nestjs-query/commit/0d28b0b968468f821e9b6cf7d53e6d95af22e710))
* **graphql:** Fix paging to properly check next/previous page ([13c7bd9](https://github.com/TriPSs/nestjs-query/commit/13c7bd90dae9e5d6ffd33a8813b2cdfcc75ae131))
* **graphql:** Include inherited references and relations ([26dd6f9](https://github.com/TriPSs/nestjs-query/commit/26dd6f972379cad736f483912c7a2cf44d0ba966))
* **imports:** Remove additional /src references ([9528772](https://github.com/TriPSs/nestjs-query/commit/9528772fd4f9b4448112d912e913d07fddf4b619))
* NestjsQueryGraphqlModuleOpts ([984f591](https://github.com/TriPSs/nestjs-query/commit/984f5917db5971a336054186f8a7fddc522745cc))
* **query-graphql:** adapt createFromPromise typings and add tests for passing additional query params ([d81e531](https://github.com/TriPSs/nestjs-query/commit/d81e5315cbc6e2d665256fd6dcfa09689cadd2b1))
* **query-graphql:** Custom authorizers now behave like auth decorators ([ff92b9a](https://github.com/TriPSs/nestjs-query/commit/ff92b9ae7a0ae4fb9585bead9b778e26fbd6b95a))
* **query-graphql:** Do not generate aggregate types if disabled ([abd62a5](https://github.com/TriPSs/nestjs-query/commit/abd62a52a8c1f32814d4477a97c269eb1c078771))
* **query-graphql:** fix eslint errors ([73acbc3](https://github.com/TriPSs/nestjs-query/commit/73acbc3557d3e8cccbe7cb7e8e01dde9d4218208))
* **query-graphql:** Fixed `between` and `notBetween` types not generated ([be4bed6](https://github.com/TriPSs/nestjs-query/commit/be4bed6b60d9ac8fd2432b7f5e04ac1a2a596e29))
* **query-graphql:** Fixed `ResolveOneRelation` interface ([e768900](https://github.com/TriPSs/nestjs-query/commit/e768900ae33949cb89c7ab4039b7cb008617a0e9))
* **query-graphql:** Fixed default sorting/filtering for relations ([0877c23](https://github.com/TriPSs/nestjs-query/commit/0877c2374fe37725033ec14a7dc7b0a7d3f2e026))
* **query-graphql:** Fixed empty object accepted by required filters ([f162cf3](https://github.com/TriPSs/nestjs-query/commit/f162cf3f6dde3dd6b6cb7846251a010c9c9cd9f7)), closes [doug-martin/nestjs-query#1504](https://github.com/doug-martin/nestjs-query/issues/1504)
* **query-graphql:** pass original query in keyset pager strategy ([07f9e7b](https://github.com/TriPSs/nestjs-query/commit/07f9e7b78cccc788c772776a4ced336eec016164))
* **query-graphql:** Use `getById` instead of `findById` to correctly throw not found errors ([2b98581](https://github.com/TriPSs/nestjs-query/commit/2b9858164653dba552999ac1933ac256db09e4c8))


### chore

* Update third batch of deps + linting rules ([acaff0f](https://github.com/TriPSs/nestjs-query/commit/acaff0fd56918a26cc108d6d98ef71b275400da4))


### Code Refactoring

* Move project to NX ([c70a022](https://github.com/TriPSs/nestjs-query/commit/c70a022671b84025bb10ba3db0a3e5a11ddcccd7))


### Features

* add validators ([9620cf1](https://github.com/TriPSs/nestjs-query/commit/9620cf15f1678f074341383ca08dbd55dc1e8bb3))
* Added support for `withDeleted` in `Relation` decorator ([923d972](https://github.com/TriPSs/nestjs-query/commit/923d972660d06cc76065d90b4a46f8775669ff0b))
* **aggregations,relations:** Add relation aggregation graphql enpoints ([56bb7e0](https://github.com/TriPSs/nestjs-query/commit/56bb7e0be3298ebe76159327ce54229818a6067b))
* **aggregations:** Add aggregations to graphql ([af075d2](https://github.com/TriPSs/nestjs-query/commit/af075d2e93b6abbbfbe32afcc917350f803fadaa))
* allow for passing `useSoftDelete` in resolver opts ([4c59cd8](https://github.com/TriPSs/nestjs-query/commit/4c59cd82f87663a40634523101c7f511afe77e63))
* **complexity:** Add complexity support for relations ([aa85325](https://github.com/TriPSs/nestjs-query/commit/aa853257e693cc656d6ef00d08d547f1988f16c5))
* **core:** Update assemblers to allow transforming create/update dtos ([5085d11](https://github.com/TriPSs/nestjs-query/commit/5085d1193a84396c9016821347c04f0e15eb04da))
* **graphql, #586:** Allow overriding endpoint name ([1634e71](https://github.com/TriPSs/nestjs-query/commit/1634e71e7d8eca5b3a2422b7514fea8c2f72220e)), closes [#586](https://github.com/TriPSs/nestjs-query/issues/586)
* **graphql,#1048:** added filter-only option to filterable fields ([55cb010](https://github.com/TriPSs/nestjs-query/commit/55cb0105a11224db1e61023762f030d5c2dae6bc)), closes [#1048](https://github.com/TriPSs/nestjs-query/issues/1048)
* **graphql,#1058:** Allow declaration of custom ID scalar type ([fb2ed7a](https://github.com/TriPSs/nestjs-query/commit/fb2ed7aca59d66fa8827522cf81b6e31e77161d3)), closes [#1058](https://github.com/TriPSs/nestjs-query/issues/1058)
* **graphql,#609:** Allow disabling maxResultSize ([a3cd664](https://github.com/TriPSs/nestjs-query/commit/a3cd664eb3cd2ebf81a110b7218fb69d4b4a3955)), closes [#609](https://github.com/TriPSs/nestjs-query/issues/609)
* **graphql,#958,#1160:** Enable authorizers on subscriptions ([d2f857f](https://github.com/TriPSs/nestjs-query/commit/d2f857f73540ee400f5dcc79cbb25dfba81c2963)), closes [#958](https://github.com/TriPSs/nestjs-query/issues/958) [#1160](https://github.com/TriPSs/nestjs-query/issues/1160)
* **graphql,auth,#1026:** Added convenience fields to auth context ([32df50e](https://github.com/TriPSs/nestjs-query/commit/32df50e502483bd3492a2d3481786d8931556438)), closes [#1026](https://github.com/TriPSs/nestjs-query/issues/1026)
* **graphql,auth,#1026:** Enable authorization on create methods as well ([4c7905e](https://github.com/TriPSs/nestjs-query/commit/4c7905e2c96bf3aab1841091d44599b917ecdd56)), closes [#1026](https://github.com/TriPSs/nestjs-query/issues/1026)
* **graphql,auth:** Add authorization to resolvers and relations ([9d76787](https://github.com/TriPSs/nestjs-query/commit/9d76787d031e6a731f28877c0df46cf4472b2faf))
* **graphql,auth:** Pass operation name to authorizer [#1026](https://github.com/TriPSs/nestjs-query/issues/1026) ([4343821](https://github.com/TriPSs/nestjs-query/commit/43438218d286791059a7a5f8eb40110320bdcfca))
* **graphql,connection:** Add totalCount to connections ([ed1e84a](https://github.com/TriPSs/nestjs-query/commit/ed1e84a2feb6f89c3b270fcbc1d0eaf6aec5e575))
* **graphql,core:** Add support for custom services and assemblers ([85e8658](https://github.com/TriPSs/nestjs-query/commit/85e8658c6acd495233cabb576c3458afcb8fff12))
* **graphql,hooks:** Add before hooks to graphql mutations ([3448955](https://github.com/TriPSs/nestjs-query/commit/3448955331ae24f3b08c1d8b459b13e0ae96c79f))
* **graphql,hooks:** Provide support for injectable hooks ([d100de8](https://github.com/TriPSs/nestjs-query/commit/d100de8306113c044bcbbdc0ceb373c977354255))
* **graphql,paging:** Add NONE paging strategy ([216d926](https://github.com/TriPSs/nestjs-query/commit/216d926a11bb7f4929fe9394c04af826cd3fa52f))
* **graphql,relations:** Revert back to unPagedRelation ([cb3dc62](https://github.com/TriPSs/nestjs-query/commit/cb3dc624328077267eded288f7cfbd5a6e9b7806))
* **graphql:** Add graphql module ([282c421](https://github.com/TriPSs/nestjs-query/commit/282c421d0e6f67fe750fa6005f6cb7d960c8fbd0))
* **graphql:** Add graphql subscriptions ([5dc987f](https://github.com/TriPSs/nestjs-query/commit/5dc987f435e0680192313e208359839f9c21d70b))
* **graphql:** Add keyset connections ([36bdbdd](https://github.com/TriPSs/nestjs-query/commit/36bdbdd9fda8b1db531ceb65c3a7c604c3da23fe))
* **graphql:** Add limit offset paging without connections ([5fc3e90](https://github.com/TriPSs/nestjs-query/commit/5fc3e90c0c738cc653eab57eb0be3c98dae51c3e))
* **graphql:** Add new aggregate groupBy ([922e696](https://github.com/TriPSs/nestjs-query/commit/922e696df1c56d5d0181cbb769ffbfba943157dd))
* **graphql:** Add relation/connection decorators ([a75cf96](https://github.com/TriPSs/nestjs-query/commit/a75cf96c18dcc3fb1f8899933959753f66b68d7e))
* **graphql:** Add support for auto-generated federations ([238f641](https://github.com/TriPSs/nestjs-query/commit/238f641967ea6668dfb7bd9034fec732da7fe38b))
* **graphql:** Added new offset connection with totalCount ([2780e7e](https://github.com/TriPSs/nestjs-query/commit/2780e7ebfefbcee010797b244fcb46a182a4102e))
* **graphql:** Allow disabling `and`/`or` filters ([c20fdbd](https://github.com/TriPSs/nestjs-query/commit/c20fdbd9774a541cf4ada8df1c5981e12ede7e8d))
* **graphql:** Allow specifying allowed comparisons on filterable fields ([ced2792](https://github.com/TriPSs/nestjs-query/commit/ced27920e5c2278c2a04c027a692e25b3306f6cb))
* **graphql:** Allow specifying fields that are required when querying ([a425ba7](https://github.com/TriPSs/nestjs-query/commit/a425ba73b0fc5a184db5b10a709ed78fd234ba7a))
* **graphql:** basic federation support ([b3e4ae4](https://github.com/TriPSs/nestjs-query/commit/b3e4ae42db2f8b81aa1153be9c943c25465fdd82))
* **graphql:** Enable filtering on ORM relations ([60229b8](https://github.com/TriPSs/nestjs-query/commit/60229b8fe981a863e8f31f1734c0b9a1aa001cf2))
* **graphql:** Enabling registering DTOs without auto-generating a resolver ([2f18142](https://github.com/TriPSs/nestjs-query/commit/2f18142edf5a0dc0563099b532d54f4a44ac7e56))
* **graphql:** Expose setRelations mutation ([676a4d5](https://github.com/TriPSs/nestjs-query/commit/676a4d5fc16717ae10c8f9f8e71550f1a42d6b2e))
* **graphql:** propagate correct query types throughout paging ([348044f](https://github.com/TriPSs/nestjs-query/commit/348044f8509d8aef21e4a5f55b93bd28793b0fcc))
* **query-graphql:** Added `disableFilter` and `disableSort` ([80cc8e9](https://github.com/TriPSs/nestjs-query/commit/80cc8e988b73d057812cba901e909e1774eea77c))
* **query-graphql:** allow descriptions to be defined ([568f228](https://github.com/TriPSs/nestjs-query/commit/568f2288efaefcbe0d3360284d626e6030165374))
* **query-graphql:** allow descriptions to be defined in relations ([0fe9580](https://github.com/TriPSs/nestjs-query/commit/0fe9580bae5c292f2760e123e88f569e60253df4))
* **sequelize:** Initial Sequelize support ([bfcf436](https://github.com/TriPSs/nestjs-query/commit/bfcf4368b96617113c0334cd78a8881e4952eb99))
* **typegoose:** Add typegoose package ([#846](https://github.com/TriPSs/nestjs-query/issues/846)) ([73cf5cd](https://github.com/TriPSs/nestjs-query/commit/73cf5cdbf11496ad3a3ce3f6bb69975510de26e2))


### BREAKING CHANGES

* Nothing special, just want the major version bump as we updated a lot of deps
* Project is moved to NX, deps may still be incorrect



# 1.0.0-alpha.0 (2022-08-26)


### Bug Fixes

* BREAKING change input to id for DELETE ONE ([d8b6e68](https://github.com/TriPSs/nestjs-query/commit/d8b6e689b83a848aaca3757b5be9e47a17ceee0b))
* dataloader cacheKeyFn bigint problem ([92171dc](https://github.com/TriPSs/nestjs-query/commit/92171dcc76563c563e2586809aec6f12f00aadfa))
* **deps:** pin dependencies ([93e9f66](https://github.com/TriPSs/nestjs-query/commit/93e9f664d21e05ed1adc35f1bfafcb6acfe8e536))
* **deps:** update apollo graphql packages ([6d40b9d](https://github.com/TriPSs/nestjs-query/commit/6d40b9d10de522d7950fca8279ee2d763c17e3a5))
* **eslint:** Fix eslint to recognize sub packages ([13fdd2b](https://github.com/TriPSs/nestjs-query/commit/13fdd2b31289dbc80316cbdb5aa32edbe596bad4))
* Fix lint issues ([c3407c0](https://github.com/TriPSs/nestjs-query/commit/c3407c0abfebe2ed6563cf754bab646af124a661))
* Fixed almost all tests ([f614f04](https://github.com/TriPSs/nestjs-query/commit/f614f04e4e75c87c3e72b1c30eb7899d3770a7c1))
* **graphl,filters:** Allow for enums when filtering ([60dcc30](https://github.com/TriPSs/nestjs-query/commit/60dcc3074b36a2aeffbf4e30b04d0af3631ae02a))
* **graphql, #505:** Less restrictive readResolverOpts for auto crud ([b4e6862](https://github.com/TriPSs/nestjs-query/commit/b4e68620a973caf4a6bc9ddc9947c0be7464fb11)), closes [#505](https://github.com/TriPSs/nestjs-query/issues/505)
* **graphql,aggregations:** Exclude __typename in aggregations ([3897673](https://github.com/TriPSs/nestjs-query/commit/3897673681b30425debc329ad5d5bb442b3838fe))
* **graphql,auth,#1026:** Fixed auth context on deleteMany ([3d4efd4](https://github.com/TriPSs/nestjs-query/commit/3d4efd44fae7e2ee119e53884519e5b2700e9e72))
* **graphql,auth,#1026:** Fixed renamed export ([24b1193](https://github.com/TriPSs/nestjs-query/commit/24b11936014312d435b0d7f17c4237fd48c5dc52))
* **graphql,federation,#1051:** check for undefined as well ([298150a](https://github.com/TriPSs/nestjs-query/commit/298150a73571e08b9d4c3d24278a24b8aec8e62b)), closes [#1051](https://github.com/TriPSs/nestjs-query/issues/1051)
* **graphql,federation,#1051:** return null for references ([6cb832e](https://github.com/TriPSs/nestjs-query/commit/6cb832ebe03c4b4cc1ec133e93a39c4637c87685)), closes [#1051](https://github.com/TriPSs/nestjs-query/issues/1051)
* **graphql,hooks,#957:** Fix HookInterceptor not working with custom resolvers ([c947b3a](https://github.com/TriPSs/nestjs-query/commit/c947b3a509d9ba12310680baf8382d8ec7116fd7))
* **graphql,hooks:** Allow getting hooks from parent classes ([59a0aeb](https://github.com/TriPSs/nestjs-query/commit/59a0aebc3dabd7d23ffde576a94bc588e768efbe))
* **graphql,paging:** Fix for [#281](https://github.com/TriPSs/nestjs-query/issues/281) paging backwards windowing ([c319344](https://github.com/TriPSs/nestjs-query/commit/c3193440504f55ef8b8b08b486ae01c1b54595bc))
* **graphql,subscriptions:** Expose InjectPubSub decorator ([867022e](https://github.com/TriPSs/nestjs-query/commit/867022e1967e63659b5df24b13eb04c829569372))
* **graphql:** Add support for extending abstract object types [#82](https://github.com/TriPSs/nestjs-query/issues/82) ([5151ceb](https://github.com/TriPSs/nestjs-query/commit/5151ceb08e05a435be4f367f6f6f03568bc72a27))
* **graphql:** Allow custom scalars for comparisons ([57cbe38](https://github.com/TriPSs/nestjs-query/commit/57cbe38cdd941bafab75a660803be6ae5c0afb2c))
* **graphql:** Fix assemblers type for module passthrough ([713c41c](https://github.com/TriPSs/nestjs-query/commit/713c41cd770068f2242a380593e4a22601d6560b))
* **graphql:** Fix filters to transform to expected type [#317](https://github.com/TriPSs/nestjs-query/issues/317) ([0d28b0b](https://github.com/TriPSs/nestjs-query/commit/0d28b0b968468f821e9b6cf7d53e6d95af22e710))
* **graphql:** Fix paging to properly check next/previous page ([13c7bd9](https://github.com/TriPSs/nestjs-query/commit/13c7bd90dae9e5d6ffd33a8813b2cdfcc75ae131))
* **graphql:** Include inherited references and relations ([26dd6f9](https://github.com/TriPSs/nestjs-query/commit/26dd6f972379cad736f483912c7a2cf44d0ba966))
* **imports:** Remove additional /src references ([9528772](https://github.com/TriPSs/nestjs-query/commit/9528772fd4f9b4448112d912e913d07fddf4b619))
* NestjsQueryGraphqlModuleOpts ([984f591](https://github.com/TriPSs/nestjs-query/commit/984f5917db5971a336054186f8a7fddc522745cc))
* **query-graphql:** adapt createFromPromise typings and add tests for passing additional query params ([d81e531](https://github.com/TriPSs/nestjs-query/commit/d81e5315cbc6e2d665256fd6dcfa09689cadd2b1))
* **query-graphql:** Custom authorizers now behave like auth decorators ([ff92b9a](https://github.com/TriPSs/nestjs-query/commit/ff92b9ae7a0ae4fb9585bead9b778e26fbd6b95a))
* **query-graphql:** Do not generate aggregate types if disabled ([abd62a5](https://github.com/TriPSs/nestjs-query/commit/abd62a52a8c1f32814d4477a97c269eb1c078771))
* **query-graphql:** fix eslint errors ([73acbc3](https://github.com/TriPSs/nestjs-query/commit/73acbc3557d3e8cccbe7cb7e8e01dde9d4218208))
* **query-graphql:** Fixed `between` and `notBetween` types not generated ([be4bed6](https://github.com/TriPSs/nestjs-query/commit/be4bed6b60d9ac8fd2432b7f5e04ac1a2a596e29))
* **query-graphql:** Fixed `ResolveOneRelation` interface ([e768900](https://github.com/TriPSs/nestjs-query/commit/e768900ae33949cb89c7ab4039b7cb008617a0e9))
* **query-graphql:** Fixed default sorting/filtering for relations ([0877c23](https://github.com/TriPSs/nestjs-query/commit/0877c2374fe37725033ec14a7dc7b0a7d3f2e026))
* **query-graphql:** Fixed empty object accepted by required filters ([f162cf3](https://github.com/TriPSs/nestjs-query/commit/f162cf3f6dde3dd6b6cb7846251a010c9c9cd9f7)), closes [doug-martin/nestjs-query#1504](https://github.com/doug-martin/nestjs-query/issues/1504)
* **query-graphql:** pass original query in keyset pager strategy ([07f9e7b](https://github.com/TriPSs/nestjs-query/commit/07f9e7b78cccc788c772776a4ced336eec016164))
* **query-graphql:** Use `getById` instead of `findById` to correctly throw not found errors ([2b98581](https://github.com/TriPSs/nestjs-query/commit/2b9858164653dba552999ac1933ac256db09e4c8))


### chore

* Update third batch of deps + linting rules ([acaff0f](https://github.com/TriPSs/nestjs-query/commit/acaff0fd56918a26cc108d6d98ef71b275400da4))


### Code Refactoring

* Move project to NX ([c70a022](https://github.com/TriPSs/nestjs-query/commit/c70a022671b84025bb10ba3db0a3e5a11ddcccd7))


### Features

* add validators ([9620cf1](https://github.com/TriPSs/nestjs-query/commit/9620cf15f1678f074341383ca08dbd55dc1e8bb3))
* Added support for `withDeleted` in `Relation` decorator ([923d972](https://github.com/TriPSs/nestjs-query/commit/923d972660d06cc76065d90b4a46f8775669ff0b))
* **aggregations,relations:** Add relation aggregation graphql enpoints ([56bb7e0](https://github.com/TriPSs/nestjs-query/commit/56bb7e0be3298ebe76159327ce54229818a6067b))
* **aggregations:** Add aggregations to graphql ([af075d2](https://github.com/TriPSs/nestjs-query/commit/af075d2e93b6abbbfbe32afcc917350f803fadaa))
* allow for passing `useSoftDelete` in resolver opts ([4c59cd8](https://github.com/TriPSs/nestjs-query/commit/4c59cd82f87663a40634523101c7f511afe77e63))
* **complexity:** Add complexity support for relations ([aa85325](https://github.com/TriPSs/nestjs-query/commit/aa853257e693cc656d6ef00d08d547f1988f16c5))
* **core:** Update assemblers to allow transforming create/update dtos ([5085d11](https://github.com/TriPSs/nestjs-query/commit/5085d1193a84396c9016821347c04f0e15eb04da))
* **graphql, #586:** Allow overriding endpoint name ([1634e71](https://github.com/TriPSs/nestjs-query/commit/1634e71e7d8eca5b3a2422b7514fea8c2f72220e)), closes [#586](https://github.com/TriPSs/nestjs-query/issues/586)
* **graphql,#1048:** added filter-only option to filterable fields ([55cb010](https://github.com/TriPSs/nestjs-query/commit/55cb0105a11224db1e61023762f030d5c2dae6bc)), closes [#1048](https://github.com/TriPSs/nestjs-query/issues/1048)
* **graphql,#1058:** Allow declaration of custom ID scalar type ([fb2ed7a](https://github.com/TriPSs/nestjs-query/commit/fb2ed7aca59d66fa8827522cf81b6e31e77161d3)), closes [#1058](https://github.com/TriPSs/nestjs-query/issues/1058)
* **graphql,#609:** Allow disabling maxResultSize ([a3cd664](https://github.com/TriPSs/nestjs-query/commit/a3cd664eb3cd2ebf81a110b7218fb69d4b4a3955)), closes [#609](https://github.com/TriPSs/nestjs-query/issues/609)
* **graphql,#958,#1160:** Enable authorizers on subscriptions ([d2f857f](https://github.com/TriPSs/nestjs-query/commit/d2f857f73540ee400f5dcc79cbb25dfba81c2963)), closes [#958](https://github.com/TriPSs/nestjs-query/issues/958) [#1160](https://github.com/TriPSs/nestjs-query/issues/1160)
* **graphql,auth,#1026:** Added convenience fields to auth context ([32df50e](https://github.com/TriPSs/nestjs-query/commit/32df50e502483bd3492a2d3481786d8931556438)), closes [#1026](https://github.com/TriPSs/nestjs-query/issues/1026)
* **graphql,auth,#1026:** Enable authorization on create methods as well ([4c7905e](https://github.com/TriPSs/nestjs-query/commit/4c7905e2c96bf3aab1841091d44599b917ecdd56)), closes [#1026](https://github.com/TriPSs/nestjs-query/issues/1026)
* **graphql,auth:** Add authorization to resolvers and relations ([9d76787](https://github.com/TriPSs/nestjs-query/commit/9d76787d031e6a731f28877c0df46cf4472b2faf))
* **graphql,auth:** Pass operation name to authorizer [#1026](https://github.com/TriPSs/nestjs-query/issues/1026) ([4343821](https://github.com/TriPSs/nestjs-query/commit/43438218d286791059a7a5f8eb40110320bdcfca))
* **graphql,connection:** Add totalCount to connections ([ed1e84a](https://github.com/TriPSs/nestjs-query/commit/ed1e84a2feb6f89c3b270fcbc1d0eaf6aec5e575))
* **graphql,core:** Add support for custom services and assemblers ([85e8658](https://github.com/TriPSs/nestjs-query/commit/85e8658c6acd495233cabb576c3458afcb8fff12))
* **graphql,hooks:** Add before hooks to graphql mutations ([3448955](https://github.com/TriPSs/nestjs-query/commit/3448955331ae24f3b08c1d8b459b13e0ae96c79f))
* **graphql,hooks:** Provide support for injectable hooks ([d100de8](https://github.com/TriPSs/nestjs-query/commit/d100de8306113c044bcbbdc0ceb373c977354255))
* **graphql,paging:** Add NONE paging strategy ([216d926](https://github.com/TriPSs/nestjs-query/commit/216d926a11bb7f4929fe9394c04af826cd3fa52f))
* **graphql,relations:** Revert back to unPagedRelation ([cb3dc62](https://github.com/TriPSs/nestjs-query/commit/cb3dc624328077267eded288f7cfbd5a6e9b7806))
* **graphql:** Add graphql module ([282c421](https://github.com/TriPSs/nestjs-query/commit/282c421d0e6f67fe750fa6005f6cb7d960c8fbd0))
* **graphql:** Add graphql subscriptions ([5dc987f](https://github.com/TriPSs/nestjs-query/commit/5dc987f435e0680192313e208359839f9c21d70b))
* **graphql:** Add keyset connections ([36bdbdd](https://github.com/TriPSs/nestjs-query/commit/36bdbdd9fda8b1db531ceb65c3a7c604c3da23fe))
* **graphql:** Add limit offset paging without connections ([5fc3e90](https://github.com/TriPSs/nestjs-query/commit/5fc3e90c0c738cc653eab57eb0be3c98dae51c3e))
* **graphql:** Add new aggregate groupBy ([922e696](https://github.com/TriPSs/nestjs-query/commit/922e696df1c56d5d0181cbb769ffbfba943157dd))
* **graphql:** Add relation/connection decorators ([a75cf96](https://github.com/TriPSs/nestjs-query/commit/a75cf96c18dcc3fb1f8899933959753f66b68d7e))
* **graphql:** Add support for auto-generated federations ([238f641](https://github.com/TriPSs/nestjs-query/commit/238f641967ea6668dfb7bd9034fec732da7fe38b))
* **graphql:** Added new offset connection with totalCount ([2780e7e](https://github.com/TriPSs/nestjs-query/commit/2780e7ebfefbcee010797b244fcb46a182a4102e))
* **graphql:** Allow disabling `and`/`or` filters ([c20fdbd](https://github.com/TriPSs/nestjs-query/commit/c20fdbd9774a541cf4ada8df1c5981e12ede7e8d))
* **graphql:** Allow specifying allowed comparisons on filterable fields ([ced2792](https://github.com/TriPSs/nestjs-query/commit/ced27920e5c2278c2a04c027a692e25b3306f6cb))
* **graphql:** Allow specifying fields that are required when querying ([a425ba7](https://github.com/TriPSs/nestjs-query/commit/a425ba73b0fc5a184db5b10a709ed78fd234ba7a))
* **graphql:** basic federation support ([b3e4ae4](https://github.com/TriPSs/nestjs-query/commit/b3e4ae42db2f8b81aa1153be9c943c25465fdd82))
* **graphql:** Enable filtering on ORM relations ([60229b8](https://github.com/TriPSs/nestjs-query/commit/60229b8fe981a863e8f31f1734c0b9a1aa001cf2))
* **graphql:** Enabling registering DTOs without auto-generating a resolver ([2f18142](https://github.com/TriPSs/nestjs-query/commit/2f18142edf5a0dc0563099b532d54f4a44ac7e56))
* **graphql:** Expose setRelations mutation ([676a4d5](https://github.com/TriPSs/nestjs-query/commit/676a4d5fc16717ae10c8f9f8e71550f1a42d6b2e))
* **graphql:** propagate correct query types throughout paging ([348044f](https://github.com/TriPSs/nestjs-query/commit/348044f8509d8aef21e4a5f55b93bd28793b0fcc))
* **query-graphql:** Added `disableFilter` and `disableSort` ([80cc8e9](https://github.com/TriPSs/nestjs-query/commit/80cc8e988b73d057812cba901e909e1774eea77c))
* **query-graphql:** allow descriptions to be defined ([568f228](https://github.com/TriPSs/nestjs-query/commit/568f2288efaefcbe0d3360284d626e6030165374))
* **query-graphql:** allow descriptions to be defined in relations ([0fe9580](https://github.com/TriPSs/nestjs-query/commit/0fe9580bae5c292f2760e123e88f569e60253df4))
* **sequelize:** Initial Sequelize support ([bfcf436](https://github.com/TriPSs/nestjs-query/commit/bfcf4368b96617113c0334cd78a8881e4952eb99))
* **typegoose:** Add typegoose package ([#846](https://github.com/TriPSs/nestjs-query/issues/846)) ([73cf5cd](https://github.com/TriPSs/nestjs-query/commit/73cf5cdbf11496ad3a3ce3f6bb69975510de26e2))


### BREAKING CHANGES

* Nothing special, just want the major version bump as we updated a lot of deps
* Project is moved to NX, deps may still be incorrect



# 1.0.0-alpha.0 (2022-08-26)


### Bug Fixes

* BREAKING change input to id for DELETE ONE ([d8b6e68](https://github.com/TriPSs/nestjs-query/commit/d8b6e689b83a848aaca3757b5be9e47a17ceee0b))
* dataloader cacheKeyFn bigint problem ([92171dc](https://github.com/TriPSs/nestjs-query/commit/92171dcc76563c563e2586809aec6f12f00aadfa))
* **deps:** pin dependencies ([93e9f66](https://github.com/TriPSs/nestjs-query/commit/93e9f664d21e05ed1adc35f1bfafcb6acfe8e536))
* **deps:** update apollo graphql packages ([6d40b9d](https://github.com/TriPSs/nestjs-query/commit/6d40b9d10de522d7950fca8279ee2d763c17e3a5))
* **eslint:** Fix eslint to recognize sub packages ([13fdd2b](https://github.com/TriPSs/nestjs-query/commit/13fdd2b31289dbc80316cbdb5aa32edbe596bad4))
* Fix lint issues ([c3407c0](https://github.com/TriPSs/nestjs-query/commit/c3407c0abfebe2ed6563cf754bab646af124a661))
* Fixed almost all tests ([f614f04](https://github.com/TriPSs/nestjs-query/commit/f614f04e4e75c87c3e72b1c30eb7899d3770a7c1))
* **graphl,filters:** Allow for enums when filtering ([60dcc30](https://github.com/TriPSs/nestjs-query/commit/60dcc3074b36a2aeffbf4e30b04d0af3631ae02a))
* **graphql, #505:** Less restrictive readResolverOpts for auto crud ([b4e6862](https://github.com/TriPSs/nestjs-query/commit/b4e68620a973caf4a6bc9ddc9947c0be7464fb11)), closes [#505](https://github.com/TriPSs/nestjs-query/issues/505)
* **graphql,aggregations:** Exclude __typename in aggregations ([3897673](https://github.com/TriPSs/nestjs-query/commit/3897673681b30425debc329ad5d5bb442b3838fe))
* **graphql,auth,#1026:** Fixed auth context on deleteMany ([3d4efd4](https://github.com/TriPSs/nestjs-query/commit/3d4efd44fae7e2ee119e53884519e5b2700e9e72))
* **graphql,auth,#1026:** Fixed renamed export ([24b1193](https://github.com/TriPSs/nestjs-query/commit/24b11936014312d435b0d7f17c4237fd48c5dc52))
* **graphql,federation,#1051:** check for undefined as well ([298150a](https://github.com/TriPSs/nestjs-query/commit/298150a73571e08b9d4c3d24278a24b8aec8e62b)), closes [#1051](https://github.com/TriPSs/nestjs-query/issues/1051)
* **graphql,federation,#1051:** return null for references ([6cb832e](https://github.com/TriPSs/nestjs-query/commit/6cb832ebe03c4b4cc1ec133e93a39c4637c87685)), closes [#1051](https://github.com/TriPSs/nestjs-query/issues/1051)
* **graphql,hooks,#957:** Fix HookInterceptor not working with custom resolvers ([c947b3a](https://github.com/TriPSs/nestjs-query/commit/c947b3a509d9ba12310680baf8382d8ec7116fd7))
* **graphql,hooks:** Allow getting hooks from parent classes ([59a0aeb](https://github.com/TriPSs/nestjs-query/commit/59a0aebc3dabd7d23ffde576a94bc588e768efbe))
* **graphql,paging:** Fix for [#281](https://github.com/TriPSs/nestjs-query/issues/281) paging backwards windowing ([c319344](https://github.com/TriPSs/nestjs-query/commit/c3193440504f55ef8b8b08b486ae01c1b54595bc))
* **graphql,subscriptions:** Expose InjectPubSub decorator ([867022e](https://github.com/TriPSs/nestjs-query/commit/867022e1967e63659b5df24b13eb04c829569372))
* **graphql:** Add support for extending abstract object types [#82](https://github.com/TriPSs/nestjs-query/issues/82) ([5151ceb](https://github.com/TriPSs/nestjs-query/commit/5151ceb08e05a435be4f367f6f6f03568bc72a27))
* **graphql:** Allow custom scalars for comparisons ([57cbe38](https://github.com/TriPSs/nestjs-query/commit/57cbe38cdd941bafab75a660803be6ae5c0afb2c))
* **graphql:** Fix assemblers type for module passthrough ([713c41c](https://github.com/TriPSs/nestjs-query/commit/713c41cd770068f2242a380593e4a22601d6560b))
* **graphql:** Fix filters to transform to expected type [#317](https://github.com/TriPSs/nestjs-query/issues/317) ([0d28b0b](https://github.com/TriPSs/nestjs-query/commit/0d28b0b968468f821e9b6cf7d53e6d95af22e710))
* **graphql:** Fix paging to properly check next/previous page ([13c7bd9](https://github.com/TriPSs/nestjs-query/commit/13c7bd90dae9e5d6ffd33a8813b2cdfcc75ae131))
* **graphql:** Include inherited references and relations ([26dd6f9](https://github.com/TriPSs/nestjs-query/commit/26dd6f972379cad736f483912c7a2cf44d0ba966))
* **imports:** Remove additional /src references ([9528772](https://github.com/TriPSs/nestjs-query/commit/9528772fd4f9b4448112d912e913d07fddf4b619))
* NestjsQueryGraphqlModuleOpts ([984f591](https://github.com/TriPSs/nestjs-query/commit/984f5917db5971a336054186f8a7fddc522745cc))
* **query-graphql:** adapt createFromPromise typings and add tests for passing additional query params ([d81e531](https://github.com/TriPSs/nestjs-query/commit/d81e5315cbc6e2d665256fd6dcfa09689cadd2b1))
* **query-graphql:** Custom authorizers now behave like auth decorators ([ff92b9a](https://github.com/TriPSs/nestjs-query/commit/ff92b9ae7a0ae4fb9585bead9b778e26fbd6b95a))
* **query-graphql:** Do not generate aggregate types if disabled ([abd62a5](https://github.com/TriPSs/nestjs-query/commit/abd62a52a8c1f32814d4477a97c269eb1c078771))
* **query-graphql:** fix eslint errors ([73acbc3](https://github.com/TriPSs/nestjs-query/commit/73acbc3557d3e8cccbe7cb7e8e01dde9d4218208))
* **query-graphql:** Fixed `between` and `notBetween` types not generated ([be4bed6](https://github.com/TriPSs/nestjs-query/commit/be4bed6b60d9ac8fd2432b7f5e04ac1a2a596e29))
* **query-graphql:** Fixed `ResolveOneRelation` interface ([e768900](https://github.com/TriPSs/nestjs-query/commit/e768900ae33949cb89c7ab4039b7cb008617a0e9))
* **query-graphql:** Fixed default sorting/filtering for relations ([0877c23](https://github.com/TriPSs/nestjs-query/commit/0877c2374fe37725033ec14a7dc7b0a7d3f2e026))
* **query-graphql:** Fixed empty object accepted by required filters ([f162cf3](https://github.com/TriPSs/nestjs-query/commit/f162cf3f6dde3dd6b6cb7846251a010c9c9cd9f7)), closes [doug-martin/nestjs-query#1504](https://github.com/doug-martin/nestjs-query/issues/1504)
* **query-graphql:** pass original query in keyset pager strategy ([07f9e7b](https://github.com/TriPSs/nestjs-query/commit/07f9e7b78cccc788c772776a4ced336eec016164))
* **query-graphql:** Use `getById` instead of `findById` to correctly throw not found errors ([2b98581](https://github.com/TriPSs/nestjs-query/commit/2b9858164653dba552999ac1933ac256db09e4c8))


### chore

* Update third batch of deps + linting rules ([acaff0f](https://github.com/TriPSs/nestjs-query/commit/acaff0fd56918a26cc108d6d98ef71b275400da4))


### Code Refactoring

* Move project to NX ([c70a022](https://github.com/TriPSs/nestjs-query/commit/c70a022671b84025bb10ba3db0a3e5a11ddcccd7))


### Features

* add validators ([9620cf1](https://github.com/TriPSs/nestjs-query/commit/9620cf15f1678f074341383ca08dbd55dc1e8bb3))
* Added support for `withDeleted` in `Relation` decorator ([923d972](https://github.com/TriPSs/nestjs-query/commit/923d972660d06cc76065d90b4a46f8775669ff0b))
* **aggregations,relations:** Add relation aggregation graphql enpoints ([56bb7e0](https://github.com/TriPSs/nestjs-query/commit/56bb7e0be3298ebe76159327ce54229818a6067b))
* **aggregations:** Add aggregations to graphql ([af075d2](https://github.com/TriPSs/nestjs-query/commit/af075d2e93b6abbbfbe32afcc917350f803fadaa))
* allow for passing `useSoftDelete` in resolver opts ([4c59cd8](https://github.com/TriPSs/nestjs-query/commit/4c59cd82f87663a40634523101c7f511afe77e63))
* **complexity:** Add complexity support for relations ([aa85325](https://github.com/TriPSs/nestjs-query/commit/aa853257e693cc656d6ef00d08d547f1988f16c5))
* **core:** Update assemblers to allow transforming create/update dtos ([5085d11](https://github.com/TriPSs/nestjs-query/commit/5085d1193a84396c9016821347c04f0e15eb04da))
* **graphql, #586:** Allow overriding endpoint name ([1634e71](https://github.com/TriPSs/nestjs-query/commit/1634e71e7d8eca5b3a2422b7514fea8c2f72220e)), closes [#586](https://github.com/TriPSs/nestjs-query/issues/586)
* **graphql,#1048:** added filter-only option to filterable fields ([55cb010](https://github.com/TriPSs/nestjs-query/commit/55cb0105a11224db1e61023762f030d5c2dae6bc)), closes [#1048](https://github.com/TriPSs/nestjs-query/issues/1048)
* **graphql,#1058:** Allow declaration of custom ID scalar type ([fb2ed7a](https://github.com/TriPSs/nestjs-query/commit/fb2ed7aca59d66fa8827522cf81b6e31e77161d3)), closes [#1058](https://github.com/TriPSs/nestjs-query/issues/1058)
* **graphql,#609:** Allow disabling maxResultSize ([a3cd664](https://github.com/TriPSs/nestjs-query/commit/a3cd664eb3cd2ebf81a110b7218fb69d4b4a3955)), closes [#609](https://github.com/TriPSs/nestjs-query/issues/609)
* **graphql,#958,#1160:** Enable authorizers on subscriptions ([d2f857f](https://github.com/TriPSs/nestjs-query/commit/d2f857f73540ee400f5dcc79cbb25dfba81c2963)), closes [#958](https://github.com/TriPSs/nestjs-query/issues/958) [#1160](https://github.com/TriPSs/nestjs-query/issues/1160)
* **graphql,auth,#1026:** Added convenience fields to auth context ([32df50e](https://github.com/TriPSs/nestjs-query/commit/32df50e502483bd3492a2d3481786d8931556438)), closes [#1026](https://github.com/TriPSs/nestjs-query/issues/1026)
* **graphql,auth,#1026:** Enable authorization on create methods as well ([4c7905e](https://github.com/TriPSs/nestjs-query/commit/4c7905e2c96bf3aab1841091d44599b917ecdd56)), closes [#1026](https://github.com/TriPSs/nestjs-query/issues/1026)
* **graphql,auth:** Add authorization to resolvers and relations ([9d76787](https://github.com/TriPSs/nestjs-query/commit/9d76787d031e6a731f28877c0df46cf4472b2faf))
* **graphql,auth:** Pass operation name to authorizer [#1026](https://github.com/TriPSs/nestjs-query/issues/1026) ([4343821](https://github.com/TriPSs/nestjs-query/commit/43438218d286791059a7a5f8eb40110320bdcfca))
* **graphql,connection:** Add totalCount to connections ([ed1e84a](https://github.com/TriPSs/nestjs-query/commit/ed1e84a2feb6f89c3b270fcbc1d0eaf6aec5e575))
* **graphql,core:** Add support for custom services and assemblers ([85e8658](https://github.com/TriPSs/nestjs-query/commit/85e8658c6acd495233cabb576c3458afcb8fff12))
* **graphql,hooks:** Add before hooks to graphql mutations ([3448955](https://github.com/TriPSs/nestjs-query/commit/3448955331ae24f3b08c1d8b459b13e0ae96c79f))
* **graphql,hooks:** Provide support for injectable hooks ([d100de8](https://github.com/TriPSs/nestjs-query/commit/d100de8306113c044bcbbdc0ceb373c977354255))
* **graphql,paging:** Add NONE paging strategy ([216d926](https://github.com/TriPSs/nestjs-query/commit/216d926a11bb7f4929fe9394c04af826cd3fa52f))
* **graphql,relations:** Revert back to unPagedRelation ([cb3dc62](https://github.com/TriPSs/nestjs-query/commit/cb3dc624328077267eded288f7cfbd5a6e9b7806))
* **graphql:** Add graphql module ([282c421](https://github.com/TriPSs/nestjs-query/commit/282c421d0e6f67fe750fa6005f6cb7d960c8fbd0))
* **graphql:** Add graphql subscriptions ([5dc987f](https://github.com/TriPSs/nestjs-query/commit/5dc987f435e0680192313e208359839f9c21d70b))
* **graphql:** Add keyset connections ([36bdbdd](https://github.com/TriPSs/nestjs-query/commit/36bdbdd9fda8b1db531ceb65c3a7c604c3da23fe))
* **graphql:** Add limit offset paging without connections ([5fc3e90](https://github.com/TriPSs/nestjs-query/commit/5fc3e90c0c738cc653eab57eb0be3c98dae51c3e))
* **graphql:** Add new aggregate groupBy ([922e696](https://github.com/TriPSs/nestjs-query/commit/922e696df1c56d5d0181cbb769ffbfba943157dd))
* **graphql:** Add relation/connection decorators ([a75cf96](https://github.com/TriPSs/nestjs-query/commit/a75cf96c18dcc3fb1f8899933959753f66b68d7e))
* **graphql:** Add support for auto-generated federations ([238f641](https://github.com/TriPSs/nestjs-query/commit/238f641967ea6668dfb7bd9034fec732da7fe38b))
* **graphql:** Added new offset connection with totalCount ([2780e7e](https://github.com/TriPSs/nestjs-query/commit/2780e7ebfefbcee010797b244fcb46a182a4102e))
* **graphql:** Allow disabling `and`/`or` filters ([c20fdbd](https://github.com/TriPSs/nestjs-query/commit/c20fdbd9774a541cf4ada8df1c5981e12ede7e8d))
* **graphql:** Allow specifying allowed comparisons on filterable fields ([ced2792](https://github.com/TriPSs/nestjs-query/commit/ced27920e5c2278c2a04c027a692e25b3306f6cb))
* **graphql:** Allow specifying fields that are required when querying ([a425ba7](https://github.com/TriPSs/nestjs-query/commit/a425ba73b0fc5a184db5b10a709ed78fd234ba7a))
* **graphql:** basic federation support ([b3e4ae4](https://github.com/TriPSs/nestjs-query/commit/b3e4ae42db2f8b81aa1153be9c943c25465fdd82))
* **graphql:** Enable filtering on ORM relations ([60229b8](https://github.com/TriPSs/nestjs-query/commit/60229b8fe981a863e8f31f1734c0b9a1aa001cf2))
* **graphql:** Enabling registering DTOs without auto-generating a resolver ([2f18142](https://github.com/TriPSs/nestjs-query/commit/2f18142edf5a0dc0563099b532d54f4a44ac7e56))
* **graphql:** Expose setRelations mutation ([676a4d5](https://github.com/TriPSs/nestjs-query/commit/676a4d5fc16717ae10c8f9f8e71550f1a42d6b2e))
* **graphql:** propagate correct query types throughout paging ([348044f](https://github.com/TriPSs/nestjs-query/commit/348044f8509d8aef21e4a5f55b93bd28793b0fcc))
* **query-graphql:** Added `disableFilter` and `disableSort` ([80cc8e9](https://github.com/TriPSs/nestjs-query/commit/80cc8e988b73d057812cba901e909e1774eea77c))
* **query-graphql:** allow descriptions to be defined ([568f228](https://github.com/TriPSs/nestjs-query/commit/568f2288efaefcbe0d3360284d626e6030165374))
* **query-graphql:** allow descriptions to be defined in relations ([0fe9580](https://github.com/TriPSs/nestjs-query/commit/0fe9580bae5c292f2760e123e88f569e60253df4))
* **sequelize:** Initial Sequelize support ([bfcf436](https://github.com/TriPSs/nestjs-query/commit/bfcf4368b96617113c0334cd78a8881e4952eb99))
* **typegoose:** Add typegoose package ([#846](https://github.com/TriPSs/nestjs-query/issues/846)) ([73cf5cd](https://github.com/TriPSs/nestjs-query/commit/73cf5cdbf11496ad3a3ce3f6bb69975510de26e2))


### BREAKING CHANGES

* Nothing special, just want the major version bump as we updated a lot of deps
* Project is moved to NX, deps may still be incorrect



# 1.0.0-alpha.0 (2022-08-26)


### Bug Fixes

* BREAKING change input to id for DELETE ONE ([d8b6e68](https://github.com/TriPSs/nestjs-query/commit/d8b6e689b83a848aaca3757b5be9e47a17ceee0b))
* dataloader cacheKeyFn bigint problem ([92171dc](https://github.com/TriPSs/nestjs-query/commit/92171dcc76563c563e2586809aec6f12f00aadfa))
* **deps:** pin dependencies ([93e9f66](https://github.com/TriPSs/nestjs-query/commit/93e9f664d21e05ed1adc35f1bfafcb6acfe8e536))
* **deps:** update apollo graphql packages ([6d40b9d](https://github.com/TriPSs/nestjs-query/commit/6d40b9d10de522d7950fca8279ee2d763c17e3a5))
* **eslint:** Fix eslint to recognize sub packages ([13fdd2b](https://github.com/TriPSs/nestjs-query/commit/13fdd2b31289dbc80316cbdb5aa32edbe596bad4))
* Fix lint issues ([c3407c0](https://github.com/TriPSs/nestjs-query/commit/c3407c0abfebe2ed6563cf754bab646af124a661))
* Fixed almost all tests ([f614f04](https://github.com/TriPSs/nestjs-query/commit/f614f04e4e75c87c3e72b1c30eb7899d3770a7c1))
* **graphl,filters:** Allow for enums when filtering ([60dcc30](https://github.com/TriPSs/nestjs-query/commit/60dcc3074b36a2aeffbf4e30b04d0af3631ae02a))
* **graphql, #505:** Less restrictive readResolverOpts for auto crud ([b4e6862](https://github.com/TriPSs/nestjs-query/commit/b4e68620a973caf4a6bc9ddc9947c0be7464fb11)), closes [#505](https://github.com/TriPSs/nestjs-query/issues/505)
* **graphql,aggregations:** Exclude __typename in aggregations ([3897673](https://github.com/TriPSs/nestjs-query/commit/3897673681b30425debc329ad5d5bb442b3838fe))
* **graphql,auth,#1026:** Fixed auth context on deleteMany ([3d4efd4](https://github.com/TriPSs/nestjs-query/commit/3d4efd44fae7e2ee119e53884519e5b2700e9e72))
* **graphql,auth,#1026:** Fixed renamed export ([24b1193](https://github.com/TriPSs/nestjs-query/commit/24b11936014312d435b0d7f17c4237fd48c5dc52))
* **graphql,federation,#1051:** check for undefined as well ([298150a](https://github.com/TriPSs/nestjs-query/commit/298150a73571e08b9d4c3d24278a24b8aec8e62b)), closes [#1051](https://github.com/TriPSs/nestjs-query/issues/1051)
* **graphql,federation,#1051:** return null for references ([6cb832e](https://github.com/TriPSs/nestjs-query/commit/6cb832ebe03c4b4cc1ec133e93a39c4637c87685)), closes [#1051](https://github.com/TriPSs/nestjs-query/issues/1051)
* **graphql,hooks,#957:** Fix HookInterceptor not working with custom resolvers ([c947b3a](https://github.com/TriPSs/nestjs-query/commit/c947b3a509d9ba12310680baf8382d8ec7116fd7))
* **graphql,hooks:** Allow getting hooks from parent classes ([59a0aeb](https://github.com/TriPSs/nestjs-query/commit/59a0aebc3dabd7d23ffde576a94bc588e768efbe))
* **graphql,paging:** Fix for [#281](https://github.com/TriPSs/nestjs-query/issues/281) paging backwards windowing ([c319344](https://github.com/TriPSs/nestjs-query/commit/c3193440504f55ef8b8b08b486ae01c1b54595bc))
* **graphql,subscriptions:** Expose InjectPubSub decorator ([867022e](https://github.com/TriPSs/nestjs-query/commit/867022e1967e63659b5df24b13eb04c829569372))
* **graphql:** Add support for extending abstract object types [#82](https://github.com/TriPSs/nestjs-query/issues/82) ([5151ceb](https://github.com/TriPSs/nestjs-query/commit/5151ceb08e05a435be4f367f6f6f03568bc72a27))
* **graphql:** Allow custom scalars for comparisons ([57cbe38](https://github.com/TriPSs/nestjs-query/commit/57cbe38cdd941bafab75a660803be6ae5c0afb2c))
* **graphql:** Fix assemblers type for module passthrough ([713c41c](https://github.com/TriPSs/nestjs-query/commit/713c41cd770068f2242a380593e4a22601d6560b))
* **graphql:** Fix filters to transform to expected type [#317](https://github.com/TriPSs/nestjs-query/issues/317) ([0d28b0b](https://github.com/TriPSs/nestjs-query/commit/0d28b0b968468f821e9b6cf7d53e6d95af22e710))
* **graphql:** Fix paging to properly check next/previous page ([13c7bd9](https://github.com/TriPSs/nestjs-query/commit/13c7bd90dae9e5d6ffd33a8813b2cdfcc75ae131))
* **graphql:** Include inherited references and relations ([26dd6f9](https://github.com/TriPSs/nestjs-query/commit/26dd6f972379cad736f483912c7a2cf44d0ba966))
* **imports:** Remove additional /src references ([9528772](https://github.com/TriPSs/nestjs-query/commit/9528772fd4f9b4448112d912e913d07fddf4b619))
* NestjsQueryGraphqlModuleOpts ([984f591](https://github.com/TriPSs/nestjs-query/commit/984f5917db5971a336054186f8a7fddc522745cc))
* **query-graphql:** adapt createFromPromise typings and add tests for passing additional query params ([d81e531](https://github.com/TriPSs/nestjs-query/commit/d81e5315cbc6e2d665256fd6dcfa09689cadd2b1))
* **query-graphql:** Custom authorizers now behave like auth decorators ([ff92b9a](https://github.com/TriPSs/nestjs-query/commit/ff92b9ae7a0ae4fb9585bead9b778e26fbd6b95a))
* **query-graphql:** Do not generate aggregate types if disabled ([abd62a5](https://github.com/TriPSs/nestjs-query/commit/abd62a52a8c1f32814d4477a97c269eb1c078771))
* **query-graphql:** fix eslint errors ([73acbc3](https://github.com/TriPSs/nestjs-query/commit/73acbc3557d3e8cccbe7cb7e8e01dde9d4218208))
* **query-graphql:** Fixed `between` and `notBetween` types not generated ([be4bed6](https://github.com/TriPSs/nestjs-query/commit/be4bed6b60d9ac8fd2432b7f5e04ac1a2a596e29))
* **query-graphql:** Fixed `ResolveOneRelation` interface ([e768900](https://github.com/TriPSs/nestjs-query/commit/e768900ae33949cb89c7ab4039b7cb008617a0e9))
* **query-graphql:** Fixed default sorting/filtering for relations ([0877c23](https://github.com/TriPSs/nestjs-query/commit/0877c2374fe37725033ec14a7dc7b0a7d3f2e026))
* **query-graphql:** Fixed empty object accepted by required filters ([f162cf3](https://github.com/TriPSs/nestjs-query/commit/f162cf3f6dde3dd6b6cb7846251a010c9c9cd9f7)), closes [doug-martin/nestjs-query#1504](https://github.com/doug-martin/nestjs-query/issues/1504)
* **query-graphql:** pass original query in keyset pager strategy ([07f9e7b](https://github.com/TriPSs/nestjs-query/commit/07f9e7b78cccc788c772776a4ced336eec016164))
* **query-graphql:** Use `getById` instead of `findById` to correctly throw not found errors ([2b98581](https://github.com/TriPSs/nestjs-query/commit/2b9858164653dba552999ac1933ac256db09e4c8))


### chore

* Update third batch of deps + linting rules ([acaff0f](https://github.com/TriPSs/nestjs-query/commit/acaff0fd56918a26cc108d6d98ef71b275400da4))


### Code Refactoring

* Move project to NX ([c70a022](https://github.com/TriPSs/nestjs-query/commit/c70a022671b84025bb10ba3db0a3e5a11ddcccd7))


### Features

* add validators ([9620cf1](https://github.com/TriPSs/nestjs-query/commit/9620cf15f1678f074341383ca08dbd55dc1e8bb3))
* Added support for `withDeleted` in `Relation` decorator ([923d972](https://github.com/TriPSs/nestjs-query/commit/923d972660d06cc76065d90b4a46f8775669ff0b))
* **aggregations,relations:** Add relation aggregation graphql enpoints ([56bb7e0](https://github.com/TriPSs/nestjs-query/commit/56bb7e0be3298ebe76159327ce54229818a6067b))
* **aggregations:** Add aggregations to graphql ([af075d2](https://github.com/TriPSs/nestjs-query/commit/af075d2e93b6abbbfbe32afcc917350f803fadaa))
* allow for passing `useSoftDelete` in resolver opts ([4c59cd8](https://github.com/TriPSs/nestjs-query/commit/4c59cd82f87663a40634523101c7f511afe77e63))
* **complexity:** Add complexity support for relations ([aa85325](https://github.com/TriPSs/nestjs-query/commit/aa853257e693cc656d6ef00d08d547f1988f16c5))
* **core:** Update assemblers to allow transforming create/update dtos ([5085d11](https://github.com/TriPSs/nestjs-query/commit/5085d1193a84396c9016821347c04f0e15eb04da))
* **graphql, #586:** Allow overriding endpoint name ([1634e71](https://github.com/TriPSs/nestjs-query/commit/1634e71e7d8eca5b3a2422b7514fea8c2f72220e)), closes [#586](https://github.com/TriPSs/nestjs-query/issues/586)
* **graphql,#1048:** added filter-only option to filterable fields ([55cb010](https://github.com/TriPSs/nestjs-query/commit/55cb0105a11224db1e61023762f030d5c2dae6bc)), closes [#1048](https://github.com/TriPSs/nestjs-query/issues/1048)
* **graphql,#1058:** Allow declaration of custom ID scalar type ([fb2ed7a](https://github.com/TriPSs/nestjs-query/commit/fb2ed7aca59d66fa8827522cf81b6e31e77161d3)), closes [#1058](https://github.com/TriPSs/nestjs-query/issues/1058)
* **graphql,#609:** Allow disabling maxResultSize ([a3cd664](https://github.com/TriPSs/nestjs-query/commit/a3cd664eb3cd2ebf81a110b7218fb69d4b4a3955)), closes [#609](https://github.com/TriPSs/nestjs-query/issues/609)
* **graphql,#958,#1160:** Enable authorizers on subscriptions ([d2f857f](https://github.com/TriPSs/nestjs-query/commit/d2f857f73540ee400f5dcc79cbb25dfba81c2963)), closes [#958](https://github.com/TriPSs/nestjs-query/issues/958) [#1160](https://github.com/TriPSs/nestjs-query/issues/1160)
* **graphql,auth,#1026:** Added convenience fields to auth context ([32df50e](https://github.com/TriPSs/nestjs-query/commit/32df50e502483bd3492a2d3481786d8931556438)), closes [#1026](https://github.com/TriPSs/nestjs-query/issues/1026)
* **graphql,auth,#1026:** Enable authorization on create methods as well ([4c7905e](https://github.com/TriPSs/nestjs-query/commit/4c7905e2c96bf3aab1841091d44599b917ecdd56)), closes [#1026](https://github.com/TriPSs/nestjs-query/issues/1026)
* **graphql,auth:** Add authorization to resolvers and relations ([9d76787](https://github.com/TriPSs/nestjs-query/commit/9d76787d031e6a731f28877c0df46cf4472b2faf))
* **graphql,auth:** Pass operation name to authorizer [#1026](https://github.com/TriPSs/nestjs-query/issues/1026) ([4343821](https://github.com/TriPSs/nestjs-query/commit/43438218d286791059a7a5f8eb40110320bdcfca))
* **graphql,connection:** Add totalCount to connections ([ed1e84a](https://github.com/TriPSs/nestjs-query/commit/ed1e84a2feb6f89c3b270fcbc1d0eaf6aec5e575))
* **graphql,core:** Add support for custom services and assemblers ([85e8658](https://github.com/TriPSs/nestjs-query/commit/85e8658c6acd495233cabb576c3458afcb8fff12))
* **graphql,hooks:** Add before hooks to graphql mutations ([3448955](https://github.com/TriPSs/nestjs-query/commit/3448955331ae24f3b08c1d8b459b13e0ae96c79f))
* **graphql,hooks:** Provide support for injectable hooks ([d100de8](https://github.com/TriPSs/nestjs-query/commit/d100de8306113c044bcbbdc0ceb373c977354255))
* **graphql,paging:** Add NONE paging strategy ([216d926](https://github.com/TriPSs/nestjs-query/commit/216d926a11bb7f4929fe9394c04af826cd3fa52f))
* **graphql,relations:** Revert back to unPagedRelation ([cb3dc62](https://github.com/TriPSs/nestjs-query/commit/cb3dc624328077267eded288f7cfbd5a6e9b7806))
* **graphql:** Add graphql module ([282c421](https://github.com/TriPSs/nestjs-query/commit/282c421d0e6f67fe750fa6005f6cb7d960c8fbd0))
* **graphql:** Add graphql subscriptions ([5dc987f](https://github.com/TriPSs/nestjs-query/commit/5dc987f435e0680192313e208359839f9c21d70b))
* **graphql:** Add keyset connections ([36bdbdd](https://github.com/TriPSs/nestjs-query/commit/36bdbdd9fda8b1db531ceb65c3a7c604c3da23fe))
* **graphql:** Add limit offset paging without connections ([5fc3e90](https://github.com/TriPSs/nestjs-query/commit/5fc3e90c0c738cc653eab57eb0be3c98dae51c3e))
* **graphql:** Add new aggregate groupBy ([922e696](https://github.com/TriPSs/nestjs-query/commit/922e696df1c56d5d0181cbb769ffbfba943157dd))
* **graphql:** Add relation/connection decorators ([a75cf96](https://github.com/TriPSs/nestjs-query/commit/a75cf96c18dcc3fb1f8899933959753f66b68d7e))
* **graphql:** Add support for auto-generated federations ([238f641](https://github.com/TriPSs/nestjs-query/commit/238f641967ea6668dfb7bd9034fec732da7fe38b))
* **graphql:** Added new offset connection with totalCount ([2780e7e](https://github.com/TriPSs/nestjs-query/commit/2780e7ebfefbcee010797b244fcb46a182a4102e))
* **graphql:** Allow disabling `and`/`or` filters ([c20fdbd](https://github.com/TriPSs/nestjs-query/commit/c20fdbd9774a541cf4ada8df1c5981e12ede7e8d))
* **graphql:** Allow specifying allowed comparisons on filterable fields ([ced2792](https://github.com/TriPSs/nestjs-query/commit/ced27920e5c2278c2a04c027a692e25b3306f6cb))
* **graphql:** Allow specifying fields that are required when querying ([a425ba7](https://github.com/TriPSs/nestjs-query/commit/a425ba73b0fc5a184db5b10a709ed78fd234ba7a))
* **graphql:** basic federation support ([b3e4ae4](https://github.com/TriPSs/nestjs-query/commit/b3e4ae42db2f8b81aa1153be9c943c25465fdd82))
* **graphql:** Enable filtering on ORM relations ([60229b8](https://github.com/TriPSs/nestjs-query/commit/60229b8fe981a863e8f31f1734c0b9a1aa001cf2))
* **graphql:** Enabling registering DTOs without auto-generating a resolver ([2f18142](https://github.com/TriPSs/nestjs-query/commit/2f18142edf5a0dc0563099b532d54f4a44ac7e56))
* **graphql:** Expose setRelations mutation ([676a4d5](https://github.com/TriPSs/nestjs-query/commit/676a4d5fc16717ae10c8f9f8e71550f1a42d6b2e))
* **graphql:** propagate correct query types throughout paging ([348044f](https://github.com/TriPSs/nestjs-query/commit/348044f8509d8aef21e4a5f55b93bd28793b0fcc))
* **query-graphql:** Added `disableFilter` and `disableSort` ([80cc8e9](https://github.com/TriPSs/nestjs-query/commit/80cc8e988b73d057812cba901e909e1774eea77c))
* **query-graphql:** allow descriptions to be defined ([568f228](https://github.com/TriPSs/nestjs-query/commit/568f2288efaefcbe0d3360284d626e6030165374))
* **query-graphql:** allow descriptions to be defined in relations ([0fe9580](https://github.com/TriPSs/nestjs-query/commit/0fe9580bae5c292f2760e123e88f569e60253df4))
* **sequelize:** Initial Sequelize support ([bfcf436](https://github.com/TriPSs/nestjs-query/commit/bfcf4368b96617113c0334cd78a8881e4952eb99))
* **typegoose:** Add typegoose package ([#846](https://github.com/TriPSs/nestjs-query/issues/846)) ([73cf5cd](https://github.com/TriPSs/nestjs-query/commit/73cf5cdbf11496ad3a3ce3f6bb69975510de26e2))


### BREAKING CHANGES

* Nothing special, just want the major version bump as we updated a lot of deps
* Project is moved to NX, deps may still be incorrect



# 1.0.0-alpha.0 (2022-08-26)


### Bug Fixes

* BREAKING change input to id for DELETE ONE ([d8b6e68](https://github.com/TriPSs/nestjs-query/commit/d8b6e689b83a848aaca3757b5be9e47a17ceee0b))
* dataloader cacheKeyFn bigint problem ([92171dc](https://github.com/TriPSs/nestjs-query/commit/92171dcc76563c563e2586809aec6f12f00aadfa))
* **deps:** pin dependencies ([93e9f66](https://github.com/TriPSs/nestjs-query/commit/93e9f664d21e05ed1adc35f1bfafcb6acfe8e536))
* **deps:** update apollo graphql packages ([6d40b9d](https://github.com/TriPSs/nestjs-query/commit/6d40b9d10de522d7950fca8279ee2d763c17e3a5))
* **eslint:** Fix eslint to recognize sub packages ([13fdd2b](https://github.com/TriPSs/nestjs-query/commit/13fdd2b31289dbc80316cbdb5aa32edbe596bad4))
* Fix lint issues ([c3407c0](https://github.com/TriPSs/nestjs-query/commit/c3407c0abfebe2ed6563cf754bab646af124a661))
* Fixed almost all tests ([f614f04](https://github.com/TriPSs/nestjs-query/commit/f614f04e4e75c87c3e72b1c30eb7899d3770a7c1))
* **graphl,filters:** Allow for enums when filtering ([60dcc30](https://github.com/TriPSs/nestjs-query/commit/60dcc3074b36a2aeffbf4e30b04d0af3631ae02a))
* **graphql, #505:** Less restrictive readResolverOpts for auto crud ([b4e6862](https://github.com/TriPSs/nestjs-query/commit/b4e68620a973caf4a6bc9ddc9947c0be7464fb11)), closes [#505](https://github.com/TriPSs/nestjs-query/issues/505)
* **graphql,aggregations:** Exclude __typename in aggregations ([3897673](https://github.com/TriPSs/nestjs-query/commit/3897673681b30425debc329ad5d5bb442b3838fe))
* **graphql,auth,#1026:** Fixed auth context on deleteMany ([3d4efd4](https://github.com/TriPSs/nestjs-query/commit/3d4efd44fae7e2ee119e53884519e5b2700e9e72))
* **graphql,auth,#1026:** Fixed renamed export ([24b1193](https://github.com/TriPSs/nestjs-query/commit/24b11936014312d435b0d7f17c4237fd48c5dc52))
* **graphql,federation,#1051:** check for undefined as well ([298150a](https://github.com/TriPSs/nestjs-query/commit/298150a73571e08b9d4c3d24278a24b8aec8e62b)), closes [#1051](https://github.com/TriPSs/nestjs-query/issues/1051)
* **graphql,federation,#1051:** return null for references ([6cb832e](https://github.com/TriPSs/nestjs-query/commit/6cb832ebe03c4b4cc1ec133e93a39c4637c87685)), closes [#1051](https://github.com/TriPSs/nestjs-query/issues/1051)
* **graphql,hooks,#957:** Fix HookInterceptor not working with custom resolvers ([c947b3a](https://github.com/TriPSs/nestjs-query/commit/c947b3a509d9ba12310680baf8382d8ec7116fd7))
* **graphql,hooks:** Allow getting hooks from parent classes ([59a0aeb](https://github.com/TriPSs/nestjs-query/commit/59a0aebc3dabd7d23ffde576a94bc588e768efbe))
* **graphql,paging:** Fix for [#281](https://github.com/TriPSs/nestjs-query/issues/281) paging backwards windowing ([c319344](https://github.com/TriPSs/nestjs-query/commit/c3193440504f55ef8b8b08b486ae01c1b54595bc))
* **graphql,subscriptions:** Expose InjectPubSub decorator ([867022e](https://github.com/TriPSs/nestjs-query/commit/867022e1967e63659b5df24b13eb04c829569372))
* **graphql:** Add support for extending abstract object types [#82](https://github.com/TriPSs/nestjs-query/issues/82) ([5151ceb](https://github.com/TriPSs/nestjs-query/commit/5151ceb08e05a435be4f367f6f6f03568bc72a27))
* **graphql:** Allow custom scalars for comparisons ([57cbe38](https://github.com/TriPSs/nestjs-query/commit/57cbe38cdd941bafab75a660803be6ae5c0afb2c))
* **graphql:** Fix assemblers type for module passthrough ([713c41c](https://github.com/TriPSs/nestjs-query/commit/713c41cd770068f2242a380593e4a22601d6560b))
* **graphql:** Fix filters to transform to expected type [#317](https://github.com/TriPSs/nestjs-query/issues/317) ([0d28b0b](https://github.com/TriPSs/nestjs-query/commit/0d28b0b968468f821e9b6cf7d53e6d95af22e710))
* **graphql:** Fix paging to properly check next/previous page ([13c7bd9](https://github.com/TriPSs/nestjs-query/commit/13c7bd90dae9e5d6ffd33a8813b2cdfcc75ae131))
* **graphql:** Include inherited references and relations ([26dd6f9](https://github.com/TriPSs/nestjs-query/commit/26dd6f972379cad736f483912c7a2cf44d0ba966))
* **imports:** Remove additional /src references ([9528772](https://github.com/TriPSs/nestjs-query/commit/9528772fd4f9b4448112d912e913d07fddf4b619))
* NestjsQueryGraphqlModuleOpts ([984f591](https://github.com/TriPSs/nestjs-query/commit/984f5917db5971a336054186f8a7fddc522745cc))
* **query-graphql:** adapt createFromPromise typings and add tests for passing additional query params ([d81e531](https://github.com/TriPSs/nestjs-query/commit/d81e5315cbc6e2d665256fd6dcfa09689cadd2b1))
* **query-graphql:** Custom authorizers now behave like auth decorators ([ff92b9a](https://github.com/TriPSs/nestjs-query/commit/ff92b9ae7a0ae4fb9585bead9b778e26fbd6b95a))
* **query-graphql:** Do not generate aggregate types if disabled ([abd62a5](https://github.com/TriPSs/nestjs-query/commit/abd62a52a8c1f32814d4477a97c269eb1c078771))
* **query-graphql:** fix eslint errors ([73acbc3](https://github.com/TriPSs/nestjs-query/commit/73acbc3557d3e8cccbe7cb7e8e01dde9d4218208))
* **query-graphql:** Fixed `between` and `notBetween` types not generated ([be4bed6](https://github.com/TriPSs/nestjs-query/commit/be4bed6b60d9ac8fd2432b7f5e04ac1a2a596e29))
* **query-graphql:** Fixed `ResolveOneRelation` interface ([e768900](https://github.com/TriPSs/nestjs-query/commit/e768900ae33949cb89c7ab4039b7cb008617a0e9))
* **query-graphql:** Fixed default sorting/filtering for relations ([0877c23](https://github.com/TriPSs/nestjs-query/commit/0877c2374fe37725033ec14a7dc7b0a7d3f2e026))
* **query-graphql:** Fixed empty object accepted by required filters ([f162cf3](https://github.com/TriPSs/nestjs-query/commit/f162cf3f6dde3dd6b6cb7846251a010c9c9cd9f7)), closes [doug-martin/nestjs-query#1504](https://github.com/doug-martin/nestjs-query/issues/1504)
* **query-graphql:** pass original query in keyset pager strategy ([07f9e7b](https://github.com/TriPSs/nestjs-query/commit/07f9e7b78cccc788c772776a4ced336eec016164))
* **query-graphql:** Use `getById` instead of `findById` to correctly throw not found errors ([2b98581](https://github.com/TriPSs/nestjs-query/commit/2b9858164653dba552999ac1933ac256db09e4c8))


### chore

* Update third batch of deps + linting rules ([acaff0f](https://github.com/TriPSs/nestjs-query/commit/acaff0fd56918a26cc108d6d98ef71b275400da4))


### Code Refactoring

* Move project to NX ([c70a022](https://github.com/TriPSs/nestjs-query/commit/c70a022671b84025bb10ba3db0a3e5a11ddcccd7))


### Features

* add validators ([9620cf1](https://github.com/TriPSs/nestjs-query/commit/9620cf15f1678f074341383ca08dbd55dc1e8bb3))
* Added support for `withDeleted` in `Relation` decorator ([923d972](https://github.com/TriPSs/nestjs-query/commit/923d972660d06cc76065d90b4a46f8775669ff0b))
* **aggregations,relations:** Add relation aggregation graphql enpoints ([56bb7e0](https://github.com/TriPSs/nestjs-query/commit/56bb7e0be3298ebe76159327ce54229818a6067b))
* **aggregations:** Add aggregations to graphql ([af075d2](https://github.com/TriPSs/nestjs-query/commit/af075d2e93b6abbbfbe32afcc917350f803fadaa))
* allow for passing `useSoftDelete` in resolver opts ([4c59cd8](https://github.com/TriPSs/nestjs-query/commit/4c59cd82f87663a40634523101c7f511afe77e63))
* **complexity:** Add complexity support for relations ([aa85325](https://github.com/TriPSs/nestjs-query/commit/aa853257e693cc656d6ef00d08d547f1988f16c5))
* **core:** Update assemblers to allow transforming create/update dtos ([5085d11](https://github.com/TriPSs/nestjs-query/commit/5085d1193a84396c9016821347c04f0e15eb04da))
* **graphql, #586:** Allow overriding endpoint name ([1634e71](https://github.com/TriPSs/nestjs-query/commit/1634e71e7d8eca5b3a2422b7514fea8c2f72220e)), closes [#586](https://github.com/TriPSs/nestjs-query/issues/586)
* **graphql,#1048:** added filter-only option to filterable fields ([55cb010](https://github.com/TriPSs/nestjs-query/commit/55cb0105a11224db1e61023762f030d5c2dae6bc)), closes [#1048](https://github.com/TriPSs/nestjs-query/issues/1048)
* **graphql,#1058:** Allow declaration of custom ID scalar type ([fb2ed7a](https://github.com/TriPSs/nestjs-query/commit/fb2ed7aca59d66fa8827522cf81b6e31e77161d3)), closes [#1058](https://github.com/TriPSs/nestjs-query/issues/1058)
* **graphql,#609:** Allow disabling maxResultSize ([a3cd664](https://github.com/TriPSs/nestjs-query/commit/a3cd664eb3cd2ebf81a110b7218fb69d4b4a3955)), closes [#609](https://github.com/TriPSs/nestjs-query/issues/609)
* **graphql,#958,#1160:** Enable authorizers on subscriptions ([d2f857f](https://github.com/TriPSs/nestjs-query/commit/d2f857f73540ee400f5dcc79cbb25dfba81c2963)), closes [#958](https://github.com/TriPSs/nestjs-query/issues/958) [#1160](https://github.com/TriPSs/nestjs-query/issues/1160)
* **graphql,auth,#1026:** Added convenience fields to auth context ([32df50e](https://github.com/TriPSs/nestjs-query/commit/32df50e502483bd3492a2d3481786d8931556438)), closes [#1026](https://github.com/TriPSs/nestjs-query/issues/1026)
* **graphql,auth,#1026:** Enable authorization on create methods as well ([4c7905e](https://github.com/TriPSs/nestjs-query/commit/4c7905e2c96bf3aab1841091d44599b917ecdd56)), closes [#1026](https://github.com/TriPSs/nestjs-query/issues/1026)
* **graphql,auth:** Add authorization to resolvers and relations ([9d76787](https://github.com/TriPSs/nestjs-query/commit/9d76787d031e6a731f28877c0df46cf4472b2faf))
* **graphql,auth:** Pass operation name to authorizer [#1026](https://github.com/TriPSs/nestjs-query/issues/1026) ([4343821](https://github.com/TriPSs/nestjs-query/commit/43438218d286791059a7a5f8eb40110320bdcfca))
* **graphql,connection:** Add totalCount to connections ([ed1e84a](https://github.com/TriPSs/nestjs-query/commit/ed1e84a2feb6f89c3b270fcbc1d0eaf6aec5e575))
* **graphql,core:** Add support for custom services and assemblers ([85e8658](https://github.com/TriPSs/nestjs-query/commit/85e8658c6acd495233cabb576c3458afcb8fff12))
* **graphql,hooks:** Add before hooks to graphql mutations ([3448955](https://github.com/TriPSs/nestjs-query/commit/3448955331ae24f3b08c1d8b459b13e0ae96c79f))
* **graphql,hooks:** Provide support for injectable hooks ([d100de8](https://github.com/TriPSs/nestjs-query/commit/d100de8306113c044bcbbdc0ceb373c977354255))
* **graphql,paging:** Add NONE paging strategy ([216d926](https://github.com/TriPSs/nestjs-query/commit/216d926a11bb7f4929fe9394c04af826cd3fa52f))
* **graphql,relations:** Revert back to unPagedRelation ([cb3dc62](https://github.com/TriPSs/nestjs-query/commit/cb3dc624328077267eded288f7cfbd5a6e9b7806))
* **graphql:** Add graphql module ([282c421](https://github.com/TriPSs/nestjs-query/commit/282c421d0e6f67fe750fa6005f6cb7d960c8fbd0))
* **graphql:** Add graphql subscriptions ([5dc987f](https://github.com/TriPSs/nestjs-query/commit/5dc987f435e0680192313e208359839f9c21d70b))
* **graphql:** Add keyset connections ([36bdbdd](https://github.com/TriPSs/nestjs-query/commit/36bdbdd9fda8b1db531ceb65c3a7c604c3da23fe))
* **graphql:** Add limit offset paging without connections ([5fc3e90](https://github.com/TriPSs/nestjs-query/commit/5fc3e90c0c738cc653eab57eb0be3c98dae51c3e))
* **graphql:** Add new aggregate groupBy ([922e696](https://github.com/TriPSs/nestjs-query/commit/922e696df1c56d5d0181cbb769ffbfba943157dd))
* **graphql:** Add relation/connection decorators ([a75cf96](https://github.com/TriPSs/nestjs-query/commit/a75cf96c18dcc3fb1f8899933959753f66b68d7e))
* **graphql:** Add support for auto-generated federations ([238f641](https://github.com/TriPSs/nestjs-query/commit/238f641967ea6668dfb7bd9034fec732da7fe38b))
* **graphql:** Added new offset connection with totalCount ([2780e7e](https://github.com/TriPSs/nestjs-query/commit/2780e7ebfefbcee010797b244fcb46a182a4102e))
* **graphql:** Allow disabling `and`/`or` filters ([c20fdbd](https://github.com/TriPSs/nestjs-query/commit/c20fdbd9774a541cf4ada8df1c5981e12ede7e8d))
* **graphql:** Allow specifying allowed comparisons on filterable fields ([ced2792](https://github.com/TriPSs/nestjs-query/commit/ced27920e5c2278c2a04c027a692e25b3306f6cb))
* **graphql:** Allow specifying fields that are required when querying ([a425ba7](https://github.com/TriPSs/nestjs-query/commit/a425ba73b0fc5a184db5b10a709ed78fd234ba7a))
* **graphql:** basic federation support ([b3e4ae4](https://github.com/TriPSs/nestjs-query/commit/b3e4ae42db2f8b81aa1153be9c943c25465fdd82))
* **graphql:** Enable filtering on ORM relations ([60229b8](https://github.com/TriPSs/nestjs-query/commit/60229b8fe981a863e8f31f1734c0b9a1aa001cf2))
* **graphql:** Enabling registering DTOs without auto-generating a resolver ([2f18142](https://github.com/TriPSs/nestjs-query/commit/2f18142edf5a0dc0563099b532d54f4a44ac7e56))
* **graphql:** Expose setRelations mutation ([676a4d5](https://github.com/TriPSs/nestjs-query/commit/676a4d5fc16717ae10c8f9f8e71550f1a42d6b2e))
* **graphql:** propagate correct query types throughout paging ([348044f](https://github.com/TriPSs/nestjs-query/commit/348044f8509d8aef21e4a5f55b93bd28793b0fcc))
* **query-graphql:** Added `disableFilter` and `disableSort` ([80cc8e9](https://github.com/TriPSs/nestjs-query/commit/80cc8e988b73d057812cba901e909e1774eea77c))
* **query-graphql:** allow descriptions to be defined ([568f228](https://github.com/TriPSs/nestjs-query/commit/568f2288efaefcbe0d3360284d626e6030165374))
* **query-graphql:** allow descriptions to be defined in relations ([0fe9580](https://github.com/TriPSs/nestjs-query/commit/0fe9580bae5c292f2760e123e88f569e60253df4))
* **sequelize:** Initial Sequelize support ([bfcf436](https://github.com/TriPSs/nestjs-query/commit/bfcf4368b96617113c0334cd78a8881e4952eb99))
* **typegoose:** Add typegoose package ([#846](https://github.com/TriPSs/nestjs-query/issues/846)) ([73cf5cd](https://github.com/TriPSs/nestjs-query/commit/73cf5cdbf11496ad3a3ce3f6bb69975510de26e2))


### BREAKING CHANGES

* Nothing special, just want the major version bump as we updated a lot of deps
* Project is moved to NX, deps may still be incorrect
