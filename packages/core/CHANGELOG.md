# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.30.0](https://github.com/doug-martin/nestjs-query/compare/v0.29.0...v0.30.0) (2021-09-30)

**Note:** Version bump only for package @nestjs-query/core





# [0.29.0](https://github.com/doug-martin/nestjs-query/compare/v0.28.1...v0.29.0) (2021-09-09)

**Note:** Version bump only for package @nestjs-query/core





## [0.28.1](https://github.com/doug-martin/nestjs-query/compare/v0.28.0...v0.28.1) (2021-07-27)

**Note:** Version bump only for package @nestjs-query/core





# [0.28.0](https://github.com/doug-martin/nestjs-query/compare/v0.27.0...v0.28.0) (2021-07-19)

**Note:** Version bump only for package @nestjs-query/core





# [0.27.0](https://github.com/doug-martin/nestjs-query/compare/v0.26.0...v0.27.0) (2021-05-12)


### Features

* **graphql,#1058:** Allow declaration of custom ID scalar type ([fb2ed7a](https://github.com/doug-martin/nestjs-query/commit/fb2ed7aca59d66fa8827522cf81b6e31e77161d3)), closes [#1058](https://github.com/doug-martin/nestjs-query/issues/1058)





# [0.26.0](https://github.com/doug-martin/nestjs-query/compare/v0.25.1...v0.26.0) (2021-04-13)


### Features

* **core:** Add new `setRelations` to set oneToMany/manyToMany relations ([4c73591](https://github.com/doug-martin/nestjs-query/commit/4c7359168c0713723d18ae2dc302366fd820dc7b))





## [0.25.1](https://github.com/doug-martin/nestjs-query/compare/v0.25.0...v0.25.1) (2021-04-07)


### Bug Fixes

* **mongoose,typegoose,#881:** Allow string objectId filters ([11098c4](https://github.com/doug-martin/nestjs-query/commit/11098c441de41462fe6c45742bc317f52ea09711)), closes [#881](https://github.com/doug-martin/nestjs-query/issues/881)





# [0.25.0](https://github.com/doug-martin/nestjs-query/compare/v0.24.5...v0.25.0) (2021-03-31)


### Bug Fixes

* Add consistent sorting for aggregate queries ([4ac7a14](https://github.com/doug-martin/nestjs-query/commit/4ac7a1485c7dcd83569951298606f487608806b1))


### Features

* **core:** Add aggregate group by ([d5eb73b](https://github.com/doug-martin/nestjs-query/commit/d5eb73b9e7a193f664f46486435b7d8d76087b55))





## [0.24.4](https://github.com/doug-martin/nestjs-query/compare/v0.24.3...v0.24.4) (2021-03-18)

**Note:** Version bump only for package @nestjs-query/core





# [0.24.0](https://github.com/doug-martin/nestjs-query/compare/v0.23.1...v0.24.0) (2021-03-15)


### Features

* **typegoose:** Add typegoose package ([#846](https://github.com/doug-martin/nestjs-query/issues/846)) ([73cf5cd](https://github.com/doug-martin/nestjs-query/commit/73cf5cdbf11496ad3a3ce3f6bb69975510de26e2))





# [0.23.0](https://github.com/doug-martin/nestjs-query/compare/v0.22.0...v0.23.0) (2021-02-26)

**Note:** Version bump only for package @nestjs-query/core





# [0.22.0](https://github.com/doug-martin/nestjs-query/compare/v0.21.2...v0.22.0) (2021-02-08)

**Note:** Version bump only for package @nestjs-query/core





## [0.21.2](https://github.com/doug-martin/nestjs-query/compare/v0.21.1...v0.21.2) (2020-10-23)


### Features

* **core:** added two new filter helpers ([031012e](https://github.com/doug-martin/nestjs-query/commit/031012e96bf99e1eb08c155059fd5106b38e9faf))





# [0.21.0](https://github.com/doug-martin/nestjs-query/compare/v0.20.2...v0.21.0) (2020-10-16)


### Bug Fixes

* **core:** Look up the proper assembler with inheritance ([8bd22c5](https://github.com/doug-martin/nestjs-query/commit/8bd22c5a40974c9011d0b472dc1ebe1328ba83f6))
* **eslint:** Fix eslint to recognize sub packages ([13fdd2b](https://github.com/doug-martin/nestjs-query/commit/13fdd2b31289dbc80316cbdb5aa32edbe596bad4))


### Features

* **mongoose:** Hardening reference support ([107bba0](https://github.com/doug-martin/nestjs-query/commit/107bba040a2b1d423deb4f1e428a43cecab48e79))
* **mongoose:** Switch to native mongoose support ([5cdfa39](https://github.com/doug-martin/nestjs-query/commit/5cdfa39b7d91cf0f8438ef3387a89aac850f4452))





## [0.20.2](https://github.com/doug-martin/nestjs-query/compare/v0.20.1...v0.20.2) (2020-10-01)


### Features

* **core:** parallelize queries within relation query service ([b339a2a](https://github.com/doug-martin/nestjs-query/commit/b339a2a9a3d1ad315d92eec67ab31af18617f6ca))





## [0.20.1](https://github.com/doug-martin/nestjs-query/compare/v0.20.0...v0.20.1) (2020-09-28)

**Note:** Version bump only for package @nestjs-query/core





# [0.20.0](https://github.com/doug-martin/nestjs-query/compare/v0.19.4...v0.20.0) (2020-09-17)


### Features

* **core:** Update assemblers to allow transforming create/update dtos ([5085d11](https://github.com/doug-martin/nestjs-query/commit/5085d1193a84396c9016821347c04f0e15eb04da))
* **core:** Update query service decorator to have correct generics ([74dc618](https://github.com/doug-martin/nestjs-query/commit/74dc618b61d1ce5575843accf5ea01066020f073))





## [0.19.4](https://github.com/doug-martin/nestjs-query/compare/v0.19.3...v0.19.4) (2020-09-15)


### Features

* **graphql:** Add keyset connections ([36bdbdd](https://github.com/doug-martin/nestjs-query/commit/36bdbdd9fda8b1db531ceb65c3a7c604c3da23fe))





## [0.19.3](https://github.com/doug-martin/nestjs-query/compare/v0.19.2...v0.19.3) (2020-09-09)


### Bug Fixes

* **graphql,hooks:** Allow getting hooks from parent classes ([59a0aeb](https://github.com/doug-martin/nestjs-query/commit/59a0aebc3dabd7d23ffde576a94bc588e768efbe))





## [0.19.2](https://github.com/doug-martin/nestjs-query/compare/v0.19.1...v0.19.2) (2020-09-03)

**Note:** Version bump only for package @nestjs-query/core





# [0.19.0](https://github.com/doug-martin/nestjs-query/compare/v0.18.1...v0.19.0) (2020-09-01)


### Features

* **core:** Update QueryService to allow additional filtering ([474369b](https://github.com/doug-martin/nestjs-query/commit/474369bd46ee82e3c8510f0564019627367d467c))





## [0.18.1](https://github.com/doug-martin/nestjs-query/compare/v0.18.0...v0.18.1) (2020-08-14)


### Bug Fixes

* **core:** Fix potential stack overflow with filter comparison ([f498802](https://github.com/doug-martin/nestjs-query/commit/f49880274a32e681d9072253135a8669bec7b3b2))


### Features

* **core:** refactor null compares and improve tests ([3582ed2](https://github.com/doug-martin/nestjs-query/commit/3582ed2f6b4aa5e3fa78bd9986621b9816566156))
* refactored filter builder to support nested object filters ([1ee8dbf](https://github.com/doug-martin/nestjs-query/commit/1ee8dbf5a0ae1a1258b203da1e68901e2b8d20f8))





# [0.18.0](https://github.com/doug-martin/nestjs-query/compare/v0.17.10...v0.18.0) (2020-08-11)

**Note:** Version bump only for package @nestjs-query/core





## [0.17.10](https://github.com/doug-martin/nestjs-query/compare/v0.17.9...v0.17.10) (2020-08-01)

**Note:** Version bump only for package @nestjs-query/core





## [0.17.8](https://github.com/doug-martin/nestjs-query/compare/v0.17.7...v0.17.8) (2020-07-28)


### Features

* **graphql:** Allow specifying allowed comparisons on filterable fields ([ced2792](https://github.com/doug-martin/nestjs-query/commit/ced27920e5c2278c2a04c027a692e25b3306f6cb))





## [0.17.7](https://github.com/doug-martin/nestjs-query/compare/v0.17.6...v0.17.7) (2020-07-27)


### Features

* **core:** Added applySort, applyPaging and applyQuery [#405](https://github.com/doug-martin/nestjs-query/issues/405) ([9f9ae0d](https://github.com/doug-martin/nestjs-query/commit/9f9ae0d0722c685483f1b2e1bd501a0f3df3ff85))





## [0.17.2](https://github.com/doug-martin/nestjs-query/compare/v0.17.1...v0.17.2) (2020-07-17)

**Note:** Version bump only for package @nestjs-query/core





# [0.17.0](https://github.com/doug-martin/nestjs-query/compare/v0.16.2...v0.17.0) (2020-07-16)


### Features

* **aggregations:** Add aggregations interfaces ([d67e733](https://github.com/doug-martin/nestjs-query/commit/d67e73393d2cb8d2f0dc131a8455bb798a270e14))
* **aggregations:** Add aggregations to graphql ([af075d2](https://github.com/doug-martin/nestjs-query/commit/af075d2e93b6abbbfbe32afcc917350f803fadaa))
* **aggregations,relations,core:** Add relation aggregation to core ([a489588](https://github.com/doug-martin/nestjs-query/commit/a4895881a1e9ff76811b264cc58eeea116b3edfd))





## [0.16.2](https://github.com/doug-martin/nestjs-query/compare/v0.16.1...v0.16.2) (2020-07-09)

**Note:** Version bump only for package @nestjs-query/core





# [0.16.0](https://github.com/doug-martin/nestjs-query/compare/v0.15.1...v0.16.0) (2020-07-05)


### Features

* **core:** Add type support for nest objects in filter ([cd9d0b5](https://github.com/doug-martin/nestjs-query/commit/cd9d0b524c1f4c384dc9e5ac6baeb5a49bc068e7))





# [0.15.0](https://github.com/doug-martin/nestjs-query/compare/v0.14.3...v0.15.0) (2020-06-23)


### Features

* **graphql,connection:** Add totalCount to connections ([ed1e84a](https://github.com/doug-martin/nestjs-query/commit/ed1e84a2feb6f89c3b270fcbc1d0eaf6aec5e575))





# [0.14.0](https://github.com/doug-martin/nestjs-query/compare/v0.13.2...v0.14.0) (2020-06-18)

**Note:** Version bump only for package @nestjs-query/core





# [0.13.0](https://github.com/doug-martin/nestjs-query/compare/v0.12.0...v0.13.0) (2020-06-12)

**Note:** Version bump only for package @nestjs-query/core





# [0.12.0](https://github.com/doug-martin/nestjs-query/compare/v0.11.8...v0.12.0) (2020-06-07)


### Features

* **graphql:** Add graphql subscriptions ([5dc987f](https://github.com/doug-martin/nestjs-query/commit/5dc987f435e0680192313e208359839f9c21d70b))





## [0.11.8](https://github.com/doug-martin/nestjs-query/compare/v0.11.7...v0.11.8) (2020-05-30)

**Note:** Version bump only for package @nestjs-query/core





## [0.11.7](https://github.com/doug-martin/nestjs-query/compare/v0.11.6...v0.11.7) (2020-05-29)

**Note:** Version bump only for package @nestjs-query/core





## [0.11.6](https://github.com/doug-martin/nestjs-query/compare/v0.11.5...v0.11.6) (2020-05-26)

**Note:** Version bump only for package @nestjs-query/core





## [0.11.5](https://github.com/doug-martin/nestjs-query/compare/v0.11.4...v0.11.5) (2020-05-21)

**Note:** Version bump only for package @nestjs-query/core





## [0.11.4](https://github.com/doug-martin/nestjs-query/compare/v0.11.3...v0.11.4) (2020-05-19)

**Note:** Version bump only for package @nestjs-query/core





## [0.11.3](https://github.com/doug-martin/nestjs-query/compare/v0.11.2...v0.11.3) (2020-05-16)

**Note:** Version bump only for package @nestjs-query/core





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





# [0.10.0](https://github.com/doug-martin/nestjs-query/compare/v0.9.0...v0.10.0) (2020-04-29)


### Features

* **sequelize:** Initial Sequelize support ([bfcf436](https://github.com/doug-martin/nestjs-query/commit/bfcf4368b96617113c0334cd78a8881e4952eb99))





# [0.9.0](https://github.com/doug-martin/nestjs-query/compare/v0.8.9...v0.9.0) (2020-04-26)

**Note:** Version bump only for package @nestjs-query/core





## [0.8.9](https://github.com/doug-martin/nestjs-query/compare/v0.8.8...v0.8.9) (2020-04-24)

**Note:** Version bump only for package @nestjs-query/core





## [0.8.7](https://github.com/doug-martin/nestjs-query/compare/v0.8.6...v0.8.7) (2020-04-23)

**Note:** Version bump only for package @nestjs-query/core
