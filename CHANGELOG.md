# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.19.2](https://github.com/doug-martin/nestjs-query/compare/v0.19.1...v0.19.2) (2020-09-03)


### Bug Fixes

* **graphql, #505:** Less restrictive readResolverOpts for auto crud ([b4e6862](https://github.com/doug-martin/nestjs-query/commit/b4e68620a973caf4a6bc9ddc9947c0be7464fb11)), closes [#505](https://github.com/doug-martin/nestjs-query/issues/505)





## [0.19.1](https://github.com/doug-martin/nestjs-query/compare/v0.19.0...v0.19.1) (2020-09-02)


### Bug Fixes

* **deps:** update dependency graphql-tools to v6.2.0 ([1183fa3](https://github.com/doug-martin/nestjs-query/commit/1183fa345da9230c07b2bebaabe29647bb498f6d))
* **typeorm,#493:** Fix uni-directional relation SQL ([7887b8c](https://github.com/doug-martin/nestjs-query/commit/7887b8c94516194840df03139fecd0d5a0f38f65))





# [0.19.0](https://github.com/doug-martin/nestjs-query/compare/v0.18.1...v0.19.0) (2020-09-01)


### Bug Fixes

* **deps:** update dependency @docusaurus/core to v2.0.0-alpha.62 ([dc773f4](https://github.com/doug-martin/nestjs-query/commit/dc773f48996b1208b1f1c17c34977bbf6838e108))
* **deps:** update dependency @docusaurus/preset-classic to v2.0.0-alpha.62 ([ad5c2d2](https://github.com/doug-martin/nestjs-query/commit/ad5c2d21146aab5fd9ddc3982ec2cce547b58ffd))
* **deps:** update dependency apollo-server-express to v2.17.0 ([53398fe](https://github.com/doug-martin/nestjs-query/commit/53398fe9f2e879499892066b9a6bb90879afc8bf))
* **deps:** update dependency graphql-tools to v6.1.0 ([2394310](https://github.com/doug-martin/nestjs-query/commit/23943101d4fb52e3ba94018df4b902acf6adb2fe))
* **deps:** update dependency pg to v8.3.2 ([1a03710](https://github.com/doug-martin/nestjs-query/commit/1a037100ce497c319bd9d0be3c17088f48fa893e))
* **deps:** update dependency pg to v8.3.3 ([f471395](https://github.com/doug-martin/nestjs-query/commit/f471395a782eeabe679936c104fdb14521623441))
* **example,auth:** Fix auth example ([b26e1c6](https://github.com/doug-martin/nestjs-query/commit/b26e1c62e1f3264f68dfaf637239e409145b3106))


### Features

* **auth:** Initial Investigation ([8d40636](https://github.com/doug-martin/nestjs-query/commit/8d4063620cee52be41b7847d99bdfa8a5a2f75b7))
* **core:** Update QueryService to allow additional filtering ([474369b](https://github.com/doug-martin/nestjs-query/commit/474369bd46ee82e3c8510f0564019627367d467c))
* **graphql,auth:** Add authorization to resolvers and relations ([9d76787](https://github.com/doug-martin/nestjs-query/commit/9d76787d031e6a731f28877c0df46cf4472b2faf))
* **sequelize:** Add additional filter options to QueryService ([29fdfa7](https://github.com/doug-martin/nestjs-query/commit/29fdfa724ec199835a6493b5f9cccb6bec58f074))
* **typeorm:** Add additional filter options to QueryService ([64241dc](https://github.com/doug-martin/nestjs-query/commit/64241dc9c4565c3bb2d4f168c837578bd706c48c))





## [0.18.1](https://github.com/doug-martin/nestjs-query/compare/v0.18.0...v0.18.1) (2020-08-14)


### Bug Fixes

* **core:** Fix potential stack overflow with filter comparison ([f498802](https://github.com/doug-martin/nestjs-query/commit/f49880274a32e681d9072253135a8669bec7b3b2))
* **deps:** update dependency graphql-query-complexity to v0.7.0 ([d47bba1](https://github.com/doug-martin/nestjs-query/commit/d47bba1def07445f3e6e190d4382653f0d21ceaf))
* **deps:** update dependency graphql-tools to v6.0.17 ([b0d1648](https://github.com/doug-martin/nestjs-query/commit/b0d1648509daeb63ec3973ae598de4529ac093d8))
* **deps:** update dependency graphql-tools to v6.0.18 ([9678548](https://github.com/doug-martin/nestjs-query/commit/9678548965217ecf63151ff72f75d1358a06c181))
* **tests:** Make subTask connections tests order consistently ([ab8bab2](https://github.com/doug-martin/nestjs-query/commit/ab8bab23d1679b06e60966999a0d4e2e1f258e78))


### Features

* **core:** refactor null compares and improve tests ([3582ed2](https://github.com/doug-martin/nestjs-query/commit/3582ed2f6b4aa5e3fa78bd9986621b9816566156))
* refactored filter builder to support nested object filters ([1ee8dbf](https://github.com/doug-martin/nestjs-query/commit/1ee8dbf5a0ae1a1258b203da1e68901e2b8d20f8))





# [0.18.0](https://github.com/doug-martin/nestjs-query/compare/v0.17.10...v0.18.0) (2020-08-11)


### Bug Fixes

* **deps:** update dependency @docusaurus/core to v2.0.0-alpha.61 ([c2f03b8](https://github.com/doug-martin/nestjs-query/commit/c2f03b872d8ac111f257ef280a51ade4a5ea7ddb))
* **deps:** update dependency @docusaurus/preset-classic to v2.0.0-alpha.61 ([e052793](https://github.com/doug-martin/nestjs-query/commit/e0527932cfd52a4096441805b076b42ad739c525))
* **deps:** update dependency graphql-tools to v6.0.16 ([df3784d](https://github.com/doug-martin/nestjs-query/commit/df3784d33d0e6db04a2a160b60edf49ce52dc2ba))
* **e2e:** Making tests deterministic ([175cc2e](https://github.com/doug-martin/nestjs-query/commit/175cc2edc02a2bb58db4557812c00b657f708ca6))
* **tests:** Fix tests to be deterministic ([5dd6dac](https://github.com/doug-martin/nestjs-query/commit/5dd6dacc2ccace913c64343726474b51f814a1e4))
* **type:** Pin dev dependencies ([442db4c](https://github.com/doug-martin/nestjs-query/commit/442db4cd9b9d48d0c6a20209f0b44c4a314660ac))
* **workflow:** Fix github actions matrix reference ([a4d9447](https://github.com/doug-martin/nestjs-query/commit/a4d9447e863f0663385c652b9a1d34752d47817a))


### Features

* **typeorm:** Switch to use unioned queries for relations ([327c676](https://github.com/doug-martin/nestjs-query/commit/327c6760e3e1a7db6bb0f872928d0502345c925f))





## [0.17.10](https://github.com/doug-martin/nestjs-query/compare/v0.17.9...v0.17.10) (2020-08-01)


### Bug Fixes

* **deps:** update dependency @docusaurus/core to v2.0.0-alpha.60 ([8982a12](https://github.com/doug-martin/nestjs-query/commit/8982a125ca013e824554a3313d63710d77cf3cad))
* **deps:** update dependency @docusaurus/preset-classic to v2.0.0-alpha.60 ([3663b9b](https://github.com/doug-martin/nestjs-query/commit/3663b9b96557d6fe190578d41d62ac2540121e88))
* **deps:** update dependency rxjs to v6.6.2 ([7062be9](https://github.com/doug-martin/nestjs-query/commit/7062be9df416ed3d6e5dca96cbeef98a835a3a6c))





## [0.17.9](https://github.com/doug-martin/nestjs-query/compare/v0.17.8...v0.17.9) (2020-07-29)


### Features

* **graphql:** Allow specifying fields that are required when querying ([a425ba7](https://github.com/doug-martin/nestjs-query/commit/a425ba73b0fc5a184db5b10a709ed78fd234ba7a))





## [0.17.8](https://github.com/doug-martin/nestjs-query/compare/v0.17.7...v0.17.8) (2020-07-28)


### Bug Fixes

* **deps:** update dependency @docusaurus/core to v2.0.0-alpha.59 ([ffe2ae9](https://github.com/doug-martin/nestjs-query/commit/ffe2ae926bb43edcd970fd7618bcb5a62a8d43c4))
* **deps:** update dependency @docusaurus/preset-classic to v2.0.0-alpha.59 ([7a80894](https://github.com/doug-martin/nestjs-query/commit/7a8089499e402163383a53ce51fbee590f633c76))
* **deps:** update dependency apollo-server-express to v2.16.1 ([4989294](https://github.com/doug-martin/nestjs-query/commit/49892946b7b2d6f67ec7402946c07cee7b9bee44))


### Features

* **graphql:** Allow specifying allowed comparisons on filterable fields ([ced2792](https://github.com/doug-martin/nestjs-query/commit/ced27920e5c2278c2a04c027a692e25b3306f6cb))





## [0.17.7](https://github.com/doug-martin/nestjs-query/compare/v0.17.6...v0.17.7) (2020-07-27)


### Features

* **core:** Added applySort, applyPaging and applyQuery [#405](https://github.com/doug-martin/nestjs-query/issues/405) ([9f9ae0d](https://github.com/doug-martin/nestjs-query/commit/9f9ae0d0722c685483f1b2e1bd501a0f3df3ff85))





## [0.17.6](https://github.com/doug-martin/nestjs-query/compare/v0.17.5...v0.17.6) (2020-07-24)


### Bug Fixes

* **graphql:** Include inherited references and relations ([26dd6f9](https://github.com/doug-martin/nestjs-query/commit/26dd6f972379cad736f483912c7a2cf44d0ba966))





## [0.17.5](https://github.com/doug-martin/nestjs-query/compare/v0.17.4...v0.17.5) (2020-07-24)


### Bug Fixes

* **graphql,aggregations:** Exclude __typename in aggregations ([3897673](https://github.com/doug-martin/nestjs-query/commit/3897673681b30425debc329ad5d5bb442b3838fe))





## [0.17.4](https://github.com/doug-martin/nestjs-query/compare/v0.17.3...v0.17.4) (2020-07-23)


### Bug Fixes

* **deps:** update dependency graphql-tools to v6.0.15 ([a45ece7](https://github.com/doug-martin/nestjs-query/commit/a45ece763127793d97dbe1bbff150309962abf62))


### Features

* **graphql,hooks:** Add before hooks to graphql mutations ([3448955](https://github.com/doug-martin/nestjs-query/commit/3448955331ae24f3b08c1d8b459b13e0ae96c79f))





## [0.17.3](https://github.com/doug-martin/nestjs-query/compare/v0.17.2...v0.17.3) (2020-07-17)


### Bug Fixes

* **deps:** update dependency apollo-server-express to v2.16.0 ([0870afe](https://github.com/doug-martin/nestjs-query/commit/0870afe470e90ddeb02da79a3b06bb27b1787c3a))
* **graphql:** Fix filters to transform to expected type [#317](https://github.com/doug-martin/nestjs-query/issues/317) ([0d28b0b](https://github.com/doug-martin/nestjs-query/commit/0d28b0b968468f821e9b6cf7d53e6d95af22e710))





## [0.17.2](https://github.com/doug-martin/nestjs-query/compare/v0.17.1...v0.17.2) (2020-07-17)


### Bug Fixes

* **typeorm:** Ensure record is entity instance when saving ([3cdbbaf](https://github.com/doug-martin/nestjs-query/commit/3cdbbaff11b18bcc5e6fd29fd182e2bd66b14f17)), closes [#380](https://github.com/doug-martin/nestjs-query/issues/380)





## [0.17.1](https://github.com/doug-martin/nestjs-query/compare/v0.17.0...v0.17.1) (2020-07-17)


### Bug Fixes

* **deps:** update dependency graphql-tools to v6.0.14 ([acb7e48](https://github.com/doug-martin/nestjs-query/commit/acb7e48a052829d847f8d406123857bf411959d8))


### Features

* **complexity:** Add complexity support for relations ([aa85325](https://github.com/doug-martin/nestjs-query/commit/aa853257e693cc656d6ef00d08d547f1988f16c5))





# [0.17.0](https://github.com/doug-martin/nestjs-query/compare/v0.16.2...v0.17.0) (2020-07-16)


### Bug Fixes

* **deps:** update dependency graphql-tools to v6.0.13 ([802bb5b](https://github.com/doug-martin/nestjs-query/commit/802bb5bae9a19ba87366a363aab70480f2c3d213))


### Features

* **aggregations:** Add aggregation support to sequelize ([c37b7ae](https://github.com/doug-martin/nestjs-query/commit/c37b7aeb00fc60e7dc55893fe712dcad454edddb))
* **aggregations:** Add aggregations interfaces ([d67e733](https://github.com/doug-martin/nestjs-query/commit/d67e73393d2cb8d2f0dc131a8455bb798a270e14))
* **aggregations:** Add aggregations to graphql ([af075d2](https://github.com/doug-martin/nestjs-query/commit/af075d2e93b6abbbfbe32afcc917350f803fadaa))
* **aggregations,relations:** Add relation aggregation graphql enpoints ([56bb7e0](https://github.com/doug-martin/nestjs-query/commit/56bb7e0be3298ebe76159327ce54229818a6067b))
* **aggregations,relations,core:** Add relation aggregation to core ([a489588](https://github.com/doug-martin/nestjs-query/commit/a4895881a1e9ff76811b264cc58eeea116b3edfd))
* **aggregations,sequelize:** Add relation aggregation to sequelize ([93e7c1b](https://github.com/doug-martin/nestjs-query/commit/93e7c1ba3d03b222b08f39bbbfaf4365ce50204e))
* **aggregations,sequelize:** Fix aggregation on many-to-many relations ([db6ecb2](https://github.com/doug-martin/nestjs-query/commit/db6ecb2527a96ba232c8af911e4eb2f6ab9f8a65))
* **aggregations,typeorm:** Add relation aggregation to typeorm ([2bf35a9](https://github.com/doug-martin/nestjs-query/commit/2bf35a92ce80b1f3026fd87cb62cad17eb6eff03))
* **aggretations:** Add aggregations support to typeorm ([7233c23](https://github.com/doug-martin/nestjs-query/commit/7233c2397d0ac332e5209ab87ae62f5f555609d6))





## [0.16.2](https://github.com/doug-martin/nestjs-query/compare/v0.16.1...v0.16.2) (2020-07-09)


### Bug Fixes

* **deps:** update dependency pg to v8.2.2 ([cd7fbb5](https://github.com/doug-martin/nestjs-query/commit/cd7fbb51227a64e18c348f2e0050553c18c0815c))
* **deps:** update dependency pg to v8.3.0 ([25c8dcb](https://github.com/doug-martin/nestjs-query/commit/25c8dcb2d00ec94b6f8b5d6c6074ee4d44c115bb))
* **imports:** Remove additional /src references ([9528772](https://github.com/doug-martin/nestjs-query/commit/9528772fd4f9b4448112d912e913d07fddf4b619))





## [0.16.1](https://github.com/doug-martin/nestjs-query/compare/v0.16.0...v0.16.1) (2020-07-07)


### Bug Fixes

* **typeorm:** Fix import path in relation service [#363](https://github.com/doug-martin/nestjs-query/issues/363) ([0e6d484](https://github.com/doug-martin/nestjs-query/commit/0e6d484920960ed1966360a89af979230667b5f7))





# [0.16.0](https://github.com/doug-martin/nestjs-query/compare/v0.15.1...v0.16.0) (2020-07-05)


### Bug Fixes

* **deps:** update dependency apollo-server-express to v2.15.1 ([29f2b72](https://github.com/doug-martin/nestjs-query/commit/29f2b72dcf324bf87ed0e4ff49a1e4f2e26e956c))
* **deps:** update dependency graphql-tools to v6.0.12 ([3048277](https://github.com/doug-martin/nestjs-query/commit/30482777ef592bd4d3a8b0d41d8b4a9e8e60c9f7))
* **deps:** update dependency rxjs to v6.6.0 ([cc356f9](https://github.com/doug-martin/nestjs-query/commit/cc356f9f51f2ccf0931539798dd4a0c8138e989a))
* **deps:** update dependency sequelize to v5.22.2 ([c04d1fc](https://github.com/doug-martin/nestjs-query/commit/c04d1fc762a435dfdee99a8d6a8ee9f163df851f))
* **deps:** update dependency sequelize to v5.22.3 ([ac288e3](https://github.com/doug-martin/nestjs-query/commit/ac288e323f01608cb2fed4bce0a6bdc86ecc3921))
* **sequelize:** Change query to not use sub queries ([80c69d6](https://github.com/doug-martin/nestjs-query/commit/80c69d6b285725eb99dc05675044185d2f4343a8))


### Features

* **core:** Add type support for nest objects in filter ([cd9d0b5](https://github.com/doug-martin/nestjs-query/commit/cd9d0b524c1f4c384dc9e5ac6baeb5a49bc068e7))
* **graphql:** Enable filtering on ORM relations ([60229b8](https://github.com/doug-martin/nestjs-query/commit/60229b8fe981a863e8f31f1734c0b9a1aa001cf2))
* **sequelize:** Add support for querying for nested relations ([92a51c1](https://github.com/doug-martin/nestjs-query/commit/92a51c120aa2bf6da915037628aad041fa0fc34c))
* **typeorm:** Add support for filtering on relations ([aa8788c](https://github.com/doug-martin/nestjs-query/commit/aa8788cbbc0c95465e1633b57ca48c91b160038a))





## [0.15.1](https://github.com/doug-martin/nestjs-query/compare/v0.15.0...v0.15.1) (2020-06-27)


### Bug Fixes

* **deps:** update dependency graphql-tools to v6.0.11 ([14416c4](https://github.com/doug-martin/nestjs-query/commit/14416c41dbd0dffab105415ee45b2d7fa389a86b))
* **deps:** update dependency sequelize to v5.22.1 ([6ff765d](https://github.com/doug-martin/nestjs-query/commit/6ff765d2c8d01d99d20920f370d90d9959b183ff))





# [0.15.0](https://github.com/doug-martin/nestjs-query/compare/v0.14.3...v0.15.0) (2020-06-23)


### Features

* **graphql,connection:** Add totalCount to connections ([ed1e84a](https://github.com/doug-martin/nestjs-query/commit/ed1e84a2feb6f89c3b270fcbc1d0eaf6aec5e575))





## [0.14.3](https://github.com/doug-martin/nestjs-query/compare/v0.14.2...v0.14.3) (2020-06-20)


### Bug Fixes

* **deps:** update dependency @apollo/federation to v0.16.9 ([28ac98c](https://github.com/doug-martin/nestjs-query/commit/28ac98c2b3efbda8267dd20354009e67439cbb04))
* **graphql,subscriptions:** Expose InjectPubSub decorator ([867022e](https://github.com/doug-martin/nestjs-query/commit/867022e1967e63659b5df24b13eb04c829569372))





## [0.14.2](https://github.com/doug-martin/nestjs-query/compare/v0.14.1...v0.14.2) (2020-06-19)


### Bug Fixes

* **typeorm:** Allow using string based typeorm relations ([55c157d](https://github.com/doug-martin/nestjs-query/commit/55c157dbea9ce8c1186a2c2ea17f847857fd2226))





## [0.14.1](https://github.com/doug-martin/nestjs-query/compare/v0.14.0...v0.14.1) (2020-06-19)


### Bug Fixes

* **graphql:** Allow custom scalars for comparisons ([57cbe38](https://github.com/doug-martin/nestjs-query/commit/57cbe38cdd941bafab75a660803be6ae5c0afb2c))





# [0.14.0](https://github.com/doug-martin/nestjs-query/compare/v0.13.2...v0.14.0) (2020-06-18)


### Bug Fixes

* **deps:** update dependency @apollo/federation to v0.16.8 ([01d05c1](https://github.com/doug-martin/nestjs-query/commit/01d05c1f9739485373153acf0ecee85346ca4738))
* **deps:** update dependency @docusaurus/core to v2.0.0-alpha.58 ([1060e05](https://github.com/doug-martin/nestjs-query/commit/1060e05f4f09ab66a508385de232ac2c83f91935))
* **deps:** update dependency @docusaurus/preset-classic to v2.0.0-alpha.58 ([236cd18](https://github.com/doug-martin/nestjs-query/commit/236cd18f54855e3bb7f2f733f3c900de59a669df))
* **deps:** update dependency apollo-server-express to v2.15.0 ([355d22b](https://github.com/doug-martin/nestjs-query/commit/355d22b2995888de4383bf3867daa3f8e982971b))
* **deps:** update dependency graphql-tools to v6.0.10 ([005ee15](https://github.com/doug-martin/nestjs-query/commit/005ee15c79ed921520c07f21d54bb50859e2e7ef))


### Features

* **graphql,paging:** Add NONE paging strategy ([216d926](https://github.com/doug-martin/nestjs-query/commit/216d926a11bb7f4929fe9394c04af826cd3fa52f))





## [0.13.2](https://github.com/doug-martin/nestjs-query/compare/v0.13.1...v0.13.2) (2020-06-14)


### Bug Fixes

* **graphl,filters:** Allow for enums when filtering ([60dcc30](https://github.com/doug-martin/nestjs-query/commit/60dcc3074b36a2aeffbf4e30b04d0af3631ae02a))





## [0.13.1](https://github.com/doug-martin/nestjs-query/compare/v0.13.0...v0.13.1) (2020-06-12)


### Bug Fixes

* **graphql,paging:** Fix for [#281](https://github.com/doug-martin/nestjs-query/issues/281) paging backwards windowing ([c319344](https://github.com/doug-martin/nestjs-query/commit/c3193440504f55ef8b8b08b486ae01c1b54595bc))





# [0.13.0](https://github.com/doug-martin/nestjs-query/compare/v0.12.0...v0.13.0) (2020-06-12)


### Bug Fixes

* **deps:** update dependency @apollo/federation to v0.16.6 ([e51bb37](https://github.com/doug-martin/nestjs-query/commit/e51bb376f5b704947130da88275cb6b9d6a4a1f0))
* **deps:** update dependency apollo-server-express to v2.14.4 ([ae31896](https://github.com/doug-martin/nestjs-query/commit/ae31896f3f62db23f8ae1f3a16a3af59956ed5df))
* **deps:** update dependency graphql to v15.1.0 ([e6362fe](https://github.com/doug-martin/nestjs-query/commit/e6362fee9ba787fb8db2a15884aae5ce5db154d9))
* **deps:** update dependency graphql-tools to v6.0.9 ([4d7ccc9](https://github.com/doug-martin/nestjs-query/commit/4d7ccc92bbef2df29a7a63fb9554bbbb79c918d4))


### Features

* **graphql:** Add limit offset paging without connections ([5fc3e90](https://github.com/doug-martin/nestjs-query/commit/5fc3e90c0c738cc653eab57eb0be3c98dae51c3e))





# [0.12.0](https://github.com/doug-martin/nestjs-query/compare/v0.11.8...v0.12.0) (2020-06-07)


### Bug Fixes

* **deps:** update dependency @apollo/federation to v0.16.4 ([e000230](https://github.com/doug-martin/nestjs-query/commit/e00023069c2d6006cc8f3cc4920efdd5ae0dc859))
* **deps:** update dependency apollo-server-express to v2.14.2 [security] ([36c9649](https://github.com/doug-martin/nestjs-query/commit/36c964914ef8d75968d3649de5e9fe9d2af22f4e))
* **deps:** update dependency graphql-tools to v6.0.4 ([aaa6233](https://github.com/doug-martin/nestjs-query/commit/aaa62331b0894bd9d0d3f7b35dbc9c0b3d5425c0))
* **deps:** update dependency graphql-tools to v6.0.5 ([fe181ae](https://github.com/doug-martin/nestjs-query/commit/fe181ae67a10599974a58246cbababbb07ff32e5))
* **deps:** update dependency graphql-tools to v6.0.8 ([27cb278](https://github.com/doug-martin/nestjs-query/commit/27cb2789834c37dc4974d335aa7a435ca6850de0))


### Features

* **graphql:** Add graphql subscriptions ([5dc987f](https://github.com/doug-martin/nestjs-query/commit/5dc987f435e0680192313e208359839f9c21d70b))





## [0.11.8](https://github.com/doug-martin/nestjs-query/compare/v0.11.7...v0.11.8) (2020-05-30)

**Note:** Version bump only for package nestjs-query





## [0.11.7](https://github.com/doug-martin/nestjs-query/compare/v0.11.6...v0.11.7) (2020-05-29)


### Bug Fixes

* **deps:** update dependency @apollo/federation to v0.16.1 ([1fd84e1](https://github.com/doug-martin/nestjs-query/commit/1fd84e1fab37011be4a02f6181a1d965c523a8f1))
* **deps:** update dependency @apollo/federation to v0.16.2 ([ad047b3](https://github.com/doug-martin/nestjs-query/commit/ad047b35674219fd7907ddafdb66cf8ffbcb4640))
* **deps:** update dependency @docusaurus/core to v2.0.0-alpha.56 ([811d26d](https://github.com/doug-martin/nestjs-query/commit/811d26de4881caf4b816dce6f9d27395f3948a73))
* **deps:** update dependency @docusaurus/preset-classic to v2.0.0-alpha.56 ([b7fd2af](https://github.com/doug-martin/nestjs-query/commit/b7fd2af37ac6bb262d335a7bee9e6ac186161f1f))
* **deps:** update dependency apollo-server-express to v2.14.0 ([8ca9ee5](https://github.com/doug-martin/nestjs-query/commit/8ca9ee5a5f4a62502a064ce1e3e27dceea0b58b0))
* **deps:** update dependency apollo-server-express to v2.14.1 ([4776e70](https://github.com/doug-martin/nestjs-query/commit/4776e7052e7c7a777f332b601c9922bf1487d5e6))
* **deps:** update dependency graphql-tools to v6.0.3 ([15429a5](https://github.com/doug-martin/nestjs-query/commit/15429a5230fe983b8e91d6559deab099070eec62))





## [0.11.6](https://github.com/doug-martin/nestjs-query/compare/v0.11.5...v0.11.6) (2020-05-26)


### Bug Fixes

* **deps:** update dependency graphql-tools to v6 ([b1aeba1](https://github.com/doug-martin/nestjs-query/commit/b1aeba1411e097f4484f7beca2b05eab99e9d586))





## [0.11.5](https://github.com/doug-martin/nestjs-query/compare/v0.11.4...v0.11.5) (2020-05-21)


### Bug Fixes

* **deps:** update dependency @docusaurus/core to v2.0.0-alpha.55 ([8926e12](https://github.com/doug-martin/nestjs-query/commit/8926e1253cbc01f3c7cf9cc074d76fe47f5bb9d2))
* **deps:** update dependency @docusaurus/preset-classic to v2.0.0-alpha.55 ([1ed906f](https://github.com/doug-martin/nestjs-query/commit/1ed906f9ff80302b27754f114f2578a3948bf305))





## [0.11.4](https://github.com/doug-martin/nestjs-query/compare/v0.11.3...v0.11.4) (2020-05-19)

**Note:** Version bump only for package nestjs-query





## [0.11.3](https://github.com/doug-martin/nestjs-query/compare/v0.11.2...v0.11.3) (2020-05-16)


### Bug Fixes

* **deps:** update dependency pg to v8.2.1 ([4603b85](https://github.com/doug-martin/nestjs-query/commit/4603b85280f98b34fd4e3e58ef6b32a43701110b))





## [0.11.2](https://github.com/doug-martin/nestjs-query/compare/v0.11.1...v0.11.2) (2020-05-14)


### Bug Fixes

* Fix lint issues ([c3407c0](https://github.com/doug-martin/nestjs-query/commit/c3407c0abfebe2ed6563cf754bab646af124a661))
* **deps:** update dependency @apollo/federation to v0.16.0 ([5a5acd6](https://github.com/doug-martin/nestjs-query/commit/5a5acd6edaeee96a0a1344ed52500522c10fd129))
* **deps:** update dependency apollo-server-express to v2.13.1 ([49d214f](https://github.com/doug-martin/nestjs-query/commit/49d214f47cc2e8ebda56bdf17c052b69ba626ccd))
* **deps:** update dependency pg to v8.1.0 ([42c7d01](https://github.com/doug-martin/nestjs-query/commit/42c7d01949d339f199b5fb35376a134393f6f4c4))
* **deps:** update dependency pg to v8.2.0 ([6e20417](https://github.com/doug-martin/nestjs-query/commit/6e2041797f69cd214b59c3ec5c3f4f9068ad9961))


### Features

* **graphql,core:** Add support for custom services and assemblers ([85e8658](https://github.com/doug-martin/nestjs-query/commit/85e8658c6acd495233cabb576c3458afcb8fff12))





## [0.11.1](https://github.com/doug-martin/nestjs-query/compare/v0.11.0...v0.11.1) (2020-05-11)


### Features

* **graphql:** Add support for auto-generated federations ([238f641](https://github.com/doug-martin/nestjs-query/commit/238f641967ea6668dfb7bd9034fec732da7fe38b))





# [0.11.0](https://github.com/doug-martin/nestjs-query/compare/v0.10.2...v0.11.0) (2020-05-09)


### Bug Fixes

* **deps:** update dependency @apollo/federation to v0.15.0 ([b534056](https://github.com/doug-martin/nestjs-query/commit/b5340567221624dc5bd096e2c1e7097ac3bcc522))
* **deps:** update dependency apollo-server-express to v2.13.0 ([7525af5](https://github.com/doug-martin/nestjs-query/commit/7525af5ad2cde82ebb684c75226b4818e7b068fc))


### Features

* **graphql:** Add graphql module ([282c421](https://github.com/doug-martin/nestjs-query/commit/282c421d0e6f67fe750fa6005f6cb7d960c8fbd0))
* **graphql:** Add relation/connection decorators ([a75cf96](https://github.com/doug-martin/nestjs-query/commit/a75cf96c18dcc3fb1f8899933959753f66b68d7e))





## [0.10.2](https://github.com/doug-martin/nestjs-query/compare/v0.10.1...v0.10.2) (2020-05-04)


### Bug Fixes

* **sequelize:** Update sequelize package deps to match hoisted ([c7f5190](https://github.com/doug-martin/nestjs-query/commit/c7f5190ad1ae3d099cf9709eee36da188a455d13))





## [0.10.1](https://github.com/doug-martin/nestjs-query/compare/v0.10.0...v0.10.1) (2020-05-02)


### Bug Fixes

* **graphql:** Fix paging to properly check next/previous page ([13c7bd9](https://github.com/doug-martin/nestjs-query/commit/13c7bd90dae9e5d6ffd33a8813b2cdfcc75ae131))





# [0.10.0](https://github.com/doug-martin/nestjs-query/compare/v0.9.0...v0.10.0) (2020-04-29)


### Bug Fixes

* **deps:** update dependency @docusaurus/core to v2.0.0-alpha.54 ([d6b7e6c](https://github.com/doug-martin/nestjs-query/commit/d6b7e6c0b812f637fdc22e5a26e34d1c4b0dc8b3))
* **deps:** update dependency @docusaurus/preset-classic to v2.0.0-alpha.54 ([fae7683](https://github.com/doug-martin/nestjs-query/commit/fae7683fd8dc845dccf4422cbb518aa1ed954bdf))


### Features

* **sequelize:** Initial Sequelize support ([bfcf436](https://github.com/doug-martin/nestjs-query/commit/bfcf4368b96617113c0334cd78a8881e4952eb99))
* **sequelize:** More clean up of code ([a72bce5](https://github.com/doug-martin/nestjs-query/commit/a72bce583862ed1902ee81974d7b530e7caac4d1))





# [0.9.0](https://github.com/doug-martin/nestjs-query/compare/v0.8.9...v0.9.0) (2020-04-26)


### Bug Fixes

* **docs:** remove unused imports in example page ([a67ac24](https://github.com/doug-martin/nestjs-query/commit/a67ac24a141953dda0eac4912485e6f79022078a))


### Features

* **typeorm:** Add support for soft deletes ([2ab42fa](https://github.com/doug-martin/nestjs-query/commit/2ab42faee2802abae4d8496e2529b8eb23860ed4))





## [0.8.9](https://github.com/doug-martin/nestjs-query/compare/v0.8.8...v0.8.9) (2020-04-24)

**Note:** Version bump only for package nestjs-query





## [0.8.8](https://github.com/doug-martin/nestjs-query/compare/v0.8.7...v0.8.8) (2020-04-23)

**Note:** Version bump only for package nestjs-query





## [0.8.7](https://github.com/doug-martin/nestjs-query/compare/v0.8.6...v0.8.7) (2020-04-23)


### Bug Fixes

* **deps:** update dependency pg to v8.0.3 ([6a726e9](https://github.com/doug-martin/nestjs-query/commit/6a726e9804835a0f512773f918efe4e0c08dded8))





## v0.8.6

* chore(renovate): Renovate to include examples
* chore(renovate): Renovate set ignorePaths to empty
* fix(deps): pin dependencies
* chore(deps): Update package-lock.json
* chore(deps): Update postgres backing app to 11.7
* docs(): Update Federation Docs
* chore(lerna): add hoist to lerna.json
* chore(deps): update dependency @nestjs/graphql to v7.3.4
* chore(deps): update dependency @types/node to v13.13.2
* chore(renovate): Update to automerge devDeps
* chore(deps): update dependency coveralls to v3.0.13
* chore(deps): update dependency eslint-config-prettier to v6.11.0

## v0.8.5

* feat(graphql): basic federation support. 
* docs(graphql): federation docs.

## v0.8.4

* docs(typeorm): Call out foreign keys in entity and DTO [#84](https://github.com/doug-martin/nestjs-query/issues/84)
* docs(typeorm): Relations on an entity/dto [#85](https://github.com/doug-martin/nestjs-query/issues/85)
* chore(): upgrade dependencies.

## v0.8.3

* [FIXED]  Add support for extending abstract object types [#82](https://github.com/doug-martin/nestjs-query/issues/82)

## v0.8.2

* [TESTS] Updated graphql types tests to check schema rather than spies.

## v0.8.1

* [FIXED] Mysql error "LIMIT in subquery" [#77](https://github.com/doug-martin/nestjs-query/issues/77)
    * Changed `nestjs-query/query-typeorm` to not use subqueries to fetch relations.

## v0.8.0

* [FIXED] Defining additional UpdateDtos breaks Schema. [#72](https://github.com/doug-martin/nestjs-query/issues/72)

## v0.7.5

* [FIXED] Tables with composite primary keys are not quoted properly.
* [DOCS] Added docs for working with multiple connections [#73](https://github.com/doug-martin/nestjs-query/pull/73) - [@johannesschobel](https://github.com/johannesschobel)

## v0.7.4

* Fix code formatting
* Update root package.json with common dependencies

## v0.7.3

* [DOCS] Update docs to include a complete example of custom methods [#64](https://github.com/doug-martin/nestjs-query/issues/64)
* [FIXED] Issue where creating or updating allows specifying primary keys [#65](https://github.com/doug-martin/nestjs-query/issues/65)

## v0.7.2

* [CHORE] Updated to `@nestjs/graphql` `v7.1.3`
* Removed `PartialType` and `PartialInputType` in favor of `@nestjs/graphql` implementation.

## v0.7.1

* [FIXED] Issue where update input DTO was not automatically created

## v0.7.0

* Updated to `@nestjs/graphql` `v7.x`.
    * This was a passive change for the library usage however you should still follow the migration guide [found here](https://docs.nestjs.com/migration-guide)

## v0.6.0

* [FIXED] Get Underlying Entity Object [#41](https://github.com/doug-martin/nestjs-query/issues)
    * Changed `TypeOrmQueryService` to operate on the `Entity`
    * Added new `AssemblerQueryService` to translate between the `DTO` and `Entity`
* [ADDED] New `InjectTypeOrmQueryService` decorator to auto-create a TypeOrm query service. 

## v0.5.1

* [DOCS] Added clarification around individual resolvers and relations with examples [#42](https://github.com/doug-martin/nestjs-query/issues/42)
* [ADDED] Exposed `Relatable` mixin from `@nestjs-query/graphql` [#42](https://github.com/doug-martin/nestjs-query/issues/42)

## v0.5.0

* Added `decorators` option to resolver options to allow providing custom decorators to endpoints [#36](https://github.com/doug-martin/nestjs-query/issues/36)

## v0.4.0

* Updated all mutations to take a single `input` argument with custom fields.
    *   `createOne(input: DTO)` -> `createOne(input: { [dtoName]: DTO })`
    *   `createMany(input: DTO[])` -> `createOne(input: { [pluralDTOName]: DTO[] })`
    *   `updateOne(id: ID, input: UpdateDTO)` -> `createOne(input: { id: ID, update: UpdateDTO })`
    *   `updateMany(filter: Filter<DTO>, input: UpdateDTO)` -> `createOne(input: { filter: Filter<DTO>, update: UpdateDTO })`
    *   `deleteOne(input: ID)` -> `deleteOne(input: {id: ID})`
    *   `deleteMany(input: Filter<DTO>)` -> `createOne(input: { filter: Filter<DTO> })`
* Updated docs to reflect changes.

## v0.3.5

* [FIXED] Validate Input for Create & Update [#19](https://github.com/doug-martin/nestjs-query/issues/19)

## v0.3.4

* [FIXED] Can't remove on Many-To-Many relations [#31](https://github.com/doug-martin/nestjs-query/issues/31)

## v0.3.3

* Update typescript to 3.8.
* Update dependency versions. 

## v0.3.2

* Switched to github actions 

## v0.3.1

* Hardened TypeORM querying
    * Added filter for entity ids on relations to prevent querying for too many rows.
    * Qualify all filter and sorting columns, to prevent column name collisions. 

## v0.3.0

* Added dataloader support!
* Fixed issue with loading of many-to-many relations [#22](https://github.com/doug-martin/nestjs-query/issues/22)

## v0.2.1

* Fixed case where `@FilterableField` decorator was not passing arguments correctly to `@Field` decorator [#20](https://github.com/doug-martin/nestjs-query/issues/20)

## v0.2.0

* Add `Assemblers` to convert DTOs and Entities that are a different shape. See https://doug-martin.github.io/nestjs-query/docs/concepts/assemblers

## v0.1.0

* Add `relations` to resolvers. See https://doug-martin.github.io/nestjs-query/docs/graphql/relations

## v0.0.6

* Dont allow empty filters with `updateMany` or `deleteMany` operations.

## v0.0.5

* Add ability to specify query defaults.
   * `defaultResultSize` -  the default number of results to return from a query
   * `maxResultsSize` -  the maximum number of results to return from a query
   * `defaultSort` -  The default sort to apply to queries
   * `defaultFilter` -  The default filter to apply to queries

## v0.0.4

* Add files field to `@nestjs-query/core` `package.json`

## v0.0.3

* Fix package READMEs
* Add security scanning on sub modules.

## v0.0.2

* Add MIT license

## v0.0.1

* Initial Release
