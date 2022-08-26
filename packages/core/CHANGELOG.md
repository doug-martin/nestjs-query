 
# 1.0.0-alpha.0 (2022-08-26)


### Bug Fixes

* Add consistent sorting for aggregate queries ([4ac7a14](https://github.com/TriPSs/nestjs-query/commit/4ac7a1485c7dcd83569951298606f487608806b1))
* **core:** Fix potential stack overflow with filter comparison ([f498802](https://github.com/TriPSs/nestjs-query/commit/f49880274a32e681d9072253135a8669bec7b3b2))
* **core:** fixed filters merged incorrectly causing unexpected behavior ([588dbe5](https://github.com/TriPSs/nestjs-query/commit/588dbe5ebb166db4c5a35fa8d36a3a0ceb3a0836))
* **core:** Improved workings of `getFilterOmitting` ([28d7e6b](https://github.com/TriPSs/nestjs-query/commit/28d7e6b81f2a63a42331d0d4c5b8fb6ccd3a3d3c))
* **core:** Improved workings of `getFilterOmitting` ([cb06762](https://github.com/TriPSs/nestjs-query/commit/cb067622ae7d754706f50df8c59ac2d711688e40))
* **core:** Look up the proper assembler with inheritance ([8bd22c5](https://github.com/TriPSs/nestjs-query/commit/8bd22c5a40974c9011d0b472dc1ebe1328ba83f6))
* **core:** Use correct return types for decorators ([d328d2b](https://github.com/TriPSs/nestjs-query/commit/d328d2beb8c0ebc3048631a97e5b2023b1891b25))
* **deps:** pin dependencies ([93e9f66](https://github.com/TriPSs/nestjs-query/commit/93e9f664d21e05ed1adc35f1bfafcb6acfe8e536))
* **eslint:** Fix eslint to recognize sub packages ([13fdd2b](https://github.com/TriPSs/nestjs-query/commit/13fdd2b31289dbc80316cbdb5aa32edbe596bad4))
* Fix lint issues ([c3407c0](https://github.com/TriPSs/nestjs-query/commit/c3407c0abfebe2ed6563cf754bab646af124a661))
* **graphql,hooks:** Allow getting hooks from parent classes ([59a0aeb](https://github.com/TriPSs/nestjs-query/commit/59a0aebc3dabd7d23ffde576a94bc588e768efbe))
* **mongoose,typegoose,#881:** Allow string objectId filters ([11098c4](https://github.com/TriPSs/nestjs-query/commit/11098c441de41462fe6c45742bc317f52ea09711)), closes [#881](https://github.com/TriPSs/nestjs-query/issues/881)
* **query-typeorm:** Fixed `getManyToManyOwnerMeta` ([887df20](https://github.com/TriPSs/nestjs-query/commit/887df206eca99a80e5f8b37b5f00711d1ee3ecec))


### chore

* Update third batch of deps + linting rules ([acaff0f](https://github.com/TriPSs/nestjs-query/commit/acaff0fd56918a26cc108d6d98ef71b275400da4))


### Code Refactoring

* Move project to NX ([c70a022](https://github.com/TriPSs/nestjs-query/commit/c70a022671b84025bb10ba3db0a3e5a11ddcccd7))


### Features

* Added support for `withDeleted` in `Relation` decorator ([923d972](https://github.com/TriPSs/nestjs-query/commit/923d972660d06cc76065d90b4a46f8775669ff0b))
* **aggregations,relations,core:** Add relation aggregation to core ([a489588](https://github.com/TriPSs/nestjs-query/commit/a4895881a1e9ff76811b264cc58eeea116b3edfd))
* **aggregations:** Add aggregations interfaces ([d67e733](https://github.com/TriPSs/nestjs-query/commit/d67e73393d2cb8d2f0dc131a8455bb798a270e14))
* **aggregations:** Add aggregations to graphql ([af075d2](https://github.com/TriPSs/nestjs-query/commit/af075d2e93b6abbbfbe32afcc917350f803fadaa))
* allow for passing `useSoftDelete` in resolver opts ([4c59cd8](https://github.com/TriPSs/nestjs-query/commit/4c59cd82f87663a40634523101c7f511afe77e63))
* **core:** Add aggregate group by ([d5eb73b](https://github.com/TriPSs/nestjs-query/commit/d5eb73b9e7a193f664f46486435b7d8d76087b55))
* **core:** Add new `setRelations` to set oneToMany/manyToMany relations ([4c73591](https://github.com/TriPSs/nestjs-query/commit/4c7359168c0713723d18ae2dc302366fd820dc7b))
* **core:** Add type support for nest objects in filter ([cd9d0b5](https://github.com/TriPSs/nestjs-query/commit/cd9d0b524c1f4c384dc9e5ac6baeb5a49bc068e7))
* **core:** Added applySort, applyPaging and applyQuery [#405](https://github.com/TriPSs/nestjs-query/issues/405) ([9f9ae0d](https://github.com/TriPSs/nestjs-query/commit/9f9ae0d0722c685483f1b2e1bd501a0f3df3ff85))
* **core:** added two new filter helpers ([031012e](https://github.com/TriPSs/nestjs-query/commit/031012e96bf99e1eb08c155059fd5106b38e9faf))
* **core:** parallelize queries within relation query service ([b339a2a](https://github.com/TriPSs/nestjs-query/commit/b339a2a9a3d1ad315d92eec67ab31af18617f6ca))
* **core:** refactor null compares and improve tests ([3582ed2](https://github.com/TriPSs/nestjs-query/commit/3582ed2f6b4aa5e3fa78bd9986621b9816566156))
* **core:** Update assemblers to allow transforming create/update dtos ([5085d11](https://github.com/TriPSs/nestjs-query/commit/5085d1193a84396c9016821347c04f0e15eb04da))
* **core:** Update query service decorator to have correct generics ([74dc618](https://github.com/TriPSs/nestjs-query/commit/74dc618b61d1ce5575843accf5ea01066020f073))
* **core:** Update QueryService to allow additional filtering ([474369b](https://github.com/TriPSs/nestjs-query/commit/474369bd46ee82e3c8510f0564019627367d467c))
* **graphql,#1058:** Allow declaration of custom ID scalar type ([fb2ed7a](https://github.com/TriPSs/nestjs-query/commit/fb2ed7aca59d66fa8827522cf81b6e31e77161d3)), closes [#1058](https://github.com/TriPSs/nestjs-query/issues/1058)
* **graphql,connection:** Add totalCount to connections ([ed1e84a](https://github.com/TriPSs/nestjs-query/commit/ed1e84a2feb6f89c3b270fcbc1d0eaf6aec5e575))
* **graphql,core:** Add support for custom services and assemblers ([85e8658](https://github.com/TriPSs/nestjs-query/commit/85e8658c6acd495233cabb576c3458afcb8fff12))
* **graphql:** Add graphql module ([282c421](https://github.com/TriPSs/nestjs-query/commit/282c421d0e6f67fe750fa6005f6cb7d960c8fbd0))
* **graphql:** Add graphql subscriptions ([5dc987f](https://github.com/TriPSs/nestjs-query/commit/5dc987f435e0680192313e208359839f9c21d70b))
* **graphql:** Add keyset connections ([36bdbdd](https://github.com/TriPSs/nestjs-query/commit/36bdbdd9fda8b1db531ceb65c3a7c604c3da23fe))
* **graphql:** Add support for auto-generated federations ([238f641](https://github.com/TriPSs/nestjs-query/commit/238f641967ea6668dfb7bd9034fec732da7fe38b))
* **graphql:** Allow specifying allowed comparisons on filterable fields ([ced2792](https://github.com/TriPSs/nestjs-query/commit/ced27920e5c2278c2a04c027a692e25b3306f6cb))
* **graphql:** basic federation support ([b3e4ae4](https://github.com/TriPSs/nestjs-query/commit/b3e4ae42db2f8b81aa1153be9c943c25465fdd82))
* **mongoose:** Hardening reference support ([107bba0](https://github.com/TriPSs/nestjs-query/commit/107bba040a2b1d423deb4f1e428a43cecab48e79))
* **mongoose:** Switch to native mongoose support ([5cdfa39](https://github.com/TriPSs/nestjs-query/commit/5cdfa39b7d91cf0f8438ef3387a89aac850f4452))
* refactored filter builder to support nested object filters ([1ee8dbf](https://github.com/TriPSs/nestjs-query/commit/1ee8dbf5a0ae1a1258b203da1e68901e2b8d20f8))
* **sequelize:** Initial Sequelize support ([bfcf436](https://github.com/TriPSs/nestjs-query/commit/bfcf4368b96617113c0334cd78a8881e4952eb99))
* **typegoose:** Add typegoose package ([#846](https://github.com/TriPSs/nestjs-query/issues/846)) ([73cf5cd](https://github.com/TriPSs/nestjs-query/commit/73cf5cdbf11496ad3a3ce3f6bb69975510de26e2))


### BREAKING CHANGES

* Nothing special, just want the major version bump as we updated a lot of deps
* Project is moved to NX, deps may still be incorrect



# 1.0.0-alpha.0 (2022-08-26)


### Bug Fixes

* Add consistent sorting for aggregate queries ([4ac7a14](https://github.com/TriPSs/nestjs-query/commit/4ac7a1485c7dcd83569951298606f487608806b1))
* **core:** Fix potential stack overflow with filter comparison ([f498802](https://github.com/TriPSs/nestjs-query/commit/f49880274a32e681d9072253135a8669bec7b3b2))
* **core:** fixed filters merged incorrectly causing unexpected behavior ([588dbe5](https://github.com/TriPSs/nestjs-query/commit/588dbe5ebb166db4c5a35fa8d36a3a0ceb3a0836))
* **core:** Improved workings of `getFilterOmitting` ([28d7e6b](https://github.com/TriPSs/nestjs-query/commit/28d7e6b81f2a63a42331d0d4c5b8fb6ccd3a3d3c))
* **core:** Improved workings of `getFilterOmitting` ([cb06762](https://github.com/TriPSs/nestjs-query/commit/cb067622ae7d754706f50df8c59ac2d711688e40))
* **core:** Look up the proper assembler with inheritance ([8bd22c5](https://github.com/TriPSs/nestjs-query/commit/8bd22c5a40974c9011d0b472dc1ebe1328ba83f6))
* **core:** Use correct return types for decorators ([d328d2b](https://github.com/TriPSs/nestjs-query/commit/d328d2beb8c0ebc3048631a97e5b2023b1891b25))
* **deps:** pin dependencies ([93e9f66](https://github.com/TriPSs/nestjs-query/commit/93e9f664d21e05ed1adc35f1bfafcb6acfe8e536))
* **eslint:** Fix eslint to recognize sub packages ([13fdd2b](https://github.com/TriPSs/nestjs-query/commit/13fdd2b31289dbc80316cbdb5aa32edbe596bad4))
* Fix lint issues ([c3407c0](https://github.com/TriPSs/nestjs-query/commit/c3407c0abfebe2ed6563cf754bab646af124a661))
* **graphql,hooks:** Allow getting hooks from parent classes ([59a0aeb](https://github.com/TriPSs/nestjs-query/commit/59a0aebc3dabd7d23ffde576a94bc588e768efbe))
* **mongoose,typegoose,#881:** Allow string objectId filters ([11098c4](https://github.com/TriPSs/nestjs-query/commit/11098c441de41462fe6c45742bc317f52ea09711)), closes [#881](https://github.com/TriPSs/nestjs-query/issues/881)
* **query-typeorm:** Fixed `getManyToManyOwnerMeta` ([887df20](https://github.com/TriPSs/nestjs-query/commit/887df206eca99a80e5f8b37b5f00711d1ee3ecec))


### chore

* Update third batch of deps + linting rules ([acaff0f](https://github.com/TriPSs/nestjs-query/commit/acaff0fd56918a26cc108d6d98ef71b275400da4))


### Code Refactoring

* Move project to NX ([c70a022](https://github.com/TriPSs/nestjs-query/commit/c70a022671b84025bb10ba3db0a3e5a11ddcccd7))


### Features

* Added support for `withDeleted` in `Relation` decorator ([923d972](https://github.com/TriPSs/nestjs-query/commit/923d972660d06cc76065d90b4a46f8775669ff0b))
* **aggregations,relations,core:** Add relation aggregation to core ([a489588](https://github.com/TriPSs/nestjs-query/commit/a4895881a1e9ff76811b264cc58eeea116b3edfd))
* **aggregations:** Add aggregations interfaces ([d67e733](https://github.com/TriPSs/nestjs-query/commit/d67e73393d2cb8d2f0dc131a8455bb798a270e14))
* **aggregations:** Add aggregations to graphql ([af075d2](https://github.com/TriPSs/nestjs-query/commit/af075d2e93b6abbbfbe32afcc917350f803fadaa))
* allow for passing `useSoftDelete` in resolver opts ([4c59cd8](https://github.com/TriPSs/nestjs-query/commit/4c59cd82f87663a40634523101c7f511afe77e63))
* **core:** Add aggregate group by ([d5eb73b](https://github.com/TriPSs/nestjs-query/commit/d5eb73b9e7a193f664f46486435b7d8d76087b55))
* **core:** Add new `setRelations` to set oneToMany/manyToMany relations ([4c73591](https://github.com/TriPSs/nestjs-query/commit/4c7359168c0713723d18ae2dc302366fd820dc7b))
* **core:** Add type support for nest objects in filter ([cd9d0b5](https://github.com/TriPSs/nestjs-query/commit/cd9d0b524c1f4c384dc9e5ac6baeb5a49bc068e7))
* **core:** Added applySort, applyPaging and applyQuery [#405](https://github.com/TriPSs/nestjs-query/issues/405) ([9f9ae0d](https://github.com/TriPSs/nestjs-query/commit/9f9ae0d0722c685483f1b2e1bd501a0f3df3ff85))
* **core:** added two new filter helpers ([031012e](https://github.com/TriPSs/nestjs-query/commit/031012e96bf99e1eb08c155059fd5106b38e9faf))
* **core:** parallelize queries within relation query service ([b339a2a](https://github.com/TriPSs/nestjs-query/commit/b339a2a9a3d1ad315d92eec67ab31af18617f6ca))
* **core:** refactor null compares and improve tests ([3582ed2](https://github.com/TriPSs/nestjs-query/commit/3582ed2f6b4aa5e3fa78bd9986621b9816566156))
* **core:** Update assemblers to allow transforming create/update dtos ([5085d11](https://github.com/TriPSs/nestjs-query/commit/5085d1193a84396c9016821347c04f0e15eb04da))
* **core:** Update query service decorator to have correct generics ([74dc618](https://github.com/TriPSs/nestjs-query/commit/74dc618b61d1ce5575843accf5ea01066020f073))
* **core:** Update QueryService to allow additional filtering ([474369b](https://github.com/TriPSs/nestjs-query/commit/474369bd46ee82e3c8510f0564019627367d467c))
* **graphql,#1058:** Allow declaration of custom ID scalar type ([fb2ed7a](https://github.com/TriPSs/nestjs-query/commit/fb2ed7aca59d66fa8827522cf81b6e31e77161d3)), closes [#1058](https://github.com/TriPSs/nestjs-query/issues/1058)
* **graphql,connection:** Add totalCount to connections ([ed1e84a](https://github.com/TriPSs/nestjs-query/commit/ed1e84a2feb6f89c3b270fcbc1d0eaf6aec5e575))
* **graphql,core:** Add support for custom services and assemblers ([85e8658](https://github.com/TriPSs/nestjs-query/commit/85e8658c6acd495233cabb576c3458afcb8fff12))
* **graphql:** Add graphql module ([282c421](https://github.com/TriPSs/nestjs-query/commit/282c421d0e6f67fe750fa6005f6cb7d960c8fbd0))
* **graphql:** Add graphql subscriptions ([5dc987f](https://github.com/TriPSs/nestjs-query/commit/5dc987f435e0680192313e208359839f9c21d70b))
* **graphql:** Add keyset connections ([36bdbdd](https://github.com/TriPSs/nestjs-query/commit/36bdbdd9fda8b1db531ceb65c3a7c604c3da23fe))
* **graphql:** Add support for auto-generated federations ([238f641](https://github.com/TriPSs/nestjs-query/commit/238f641967ea6668dfb7bd9034fec732da7fe38b))
* **graphql:** Allow specifying allowed comparisons on filterable fields ([ced2792](https://github.com/TriPSs/nestjs-query/commit/ced27920e5c2278c2a04c027a692e25b3306f6cb))
* **graphql:** basic federation support ([b3e4ae4](https://github.com/TriPSs/nestjs-query/commit/b3e4ae42db2f8b81aa1153be9c943c25465fdd82))
* **mongoose:** Hardening reference support ([107bba0](https://github.com/TriPSs/nestjs-query/commit/107bba040a2b1d423deb4f1e428a43cecab48e79))
* **mongoose:** Switch to native mongoose support ([5cdfa39](https://github.com/TriPSs/nestjs-query/commit/5cdfa39b7d91cf0f8438ef3387a89aac850f4452))
* refactored filter builder to support nested object filters ([1ee8dbf](https://github.com/TriPSs/nestjs-query/commit/1ee8dbf5a0ae1a1258b203da1e68901e2b8d20f8))
* **sequelize:** Initial Sequelize support ([bfcf436](https://github.com/TriPSs/nestjs-query/commit/bfcf4368b96617113c0334cd78a8881e4952eb99))
* **typegoose:** Add typegoose package ([#846](https://github.com/TriPSs/nestjs-query/issues/846)) ([73cf5cd](https://github.com/TriPSs/nestjs-query/commit/73cf5cdbf11496ad3a3ce3f6bb69975510de26e2))


### BREAKING CHANGES

* Nothing special, just want the major version bump as we updated a lot of deps
* Project is moved to NX, deps may still be incorrect



# 1.0.0-alpha.0 (2022-08-26)


### Bug Fixes

* Add consistent sorting for aggregate queries ([4ac7a14](https://github.com/TriPSs/nestjs-query/commit/4ac7a1485c7dcd83569951298606f487608806b1))
* **core:** Fix potential stack overflow with filter comparison ([f498802](https://github.com/TriPSs/nestjs-query/commit/f49880274a32e681d9072253135a8669bec7b3b2))
* **core:** fixed filters merged incorrectly causing unexpected behavior ([588dbe5](https://github.com/TriPSs/nestjs-query/commit/588dbe5ebb166db4c5a35fa8d36a3a0ceb3a0836))
* **core:** Improved workings of `getFilterOmitting` ([28d7e6b](https://github.com/TriPSs/nestjs-query/commit/28d7e6b81f2a63a42331d0d4c5b8fb6ccd3a3d3c))
* **core:** Improved workings of `getFilterOmitting` ([cb06762](https://github.com/TriPSs/nestjs-query/commit/cb067622ae7d754706f50df8c59ac2d711688e40))
* **core:** Look up the proper assembler with inheritance ([8bd22c5](https://github.com/TriPSs/nestjs-query/commit/8bd22c5a40974c9011d0b472dc1ebe1328ba83f6))
* **core:** Use correct return types for decorators ([d328d2b](https://github.com/TriPSs/nestjs-query/commit/d328d2beb8c0ebc3048631a97e5b2023b1891b25))
* **deps:** pin dependencies ([93e9f66](https://github.com/TriPSs/nestjs-query/commit/93e9f664d21e05ed1adc35f1bfafcb6acfe8e536))
* **eslint:** Fix eslint to recognize sub packages ([13fdd2b](https://github.com/TriPSs/nestjs-query/commit/13fdd2b31289dbc80316cbdb5aa32edbe596bad4))
* Fix lint issues ([c3407c0](https://github.com/TriPSs/nestjs-query/commit/c3407c0abfebe2ed6563cf754bab646af124a661))
* **graphql,hooks:** Allow getting hooks from parent classes ([59a0aeb](https://github.com/TriPSs/nestjs-query/commit/59a0aebc3dabd7d23ffde576a94bc588e768efbe))
* **mongoose,typegoose,#881:** Allow string objectId filters ([11098c4](https://github.com/TriPSs/nestjs-query/commit/11098c441de41462fe6c45742bc317f52ea09711)), closes [#881](https://github.com/TriPSs/nestjs-query/issues/881)
* **query-typeorm:** Fixed `getManyToManyOwnerMeta` ([887df20](https://github.com/TriPSs/nestjs-query/commit/887df206eca99a80e5f8b37b5f00711d1ee3ecec))


### chore

* Update third batch of deps + linting rules ([acaff0f](https://github.com/TriPSs/nestjs-query/commit/acaff0fd56918a26cc108d6d98ef71b275400da4))


### Code Refactoring

* Move project to NX ([c70a022](https://github.com/TriPSs/nestjs-query/commit/c70a022671b84025bb10ba3db0a3e5a11ddcccd7))


### Features

* Added support for `withDeleted` in `Relation` decorator ([923d972](https://github.com/TriPSs/nestjs-query/commit/923d972660d06cc76065d90b4a46f8775669ff0b))
* **aggregations,relations,core:** Add relation aggregation to core ([a489588](https://github.com/TriPSs/nestjs-query/commit/a4895881a1e9ff76811b264cc58eeea116b3edfd))
* **aggregations:** Add aggregations interfaces ([d67e733](https://github.com/TriPSs/nestjs-query/commit/d67e73393d2cb8d2f0dc131a8455bb798a270e14))
* **aggregations:** Add aggregations to graphql ([af075d2](https://github.com/TriPSs/nestjs-query/commit/af075d2e93b6abbbfbe32afcc917350f803fadaa))
* allow for passing `useSoftDelete` in resolver opts ([4c59cd8](https://github.com/TriPSs/nestjs-query/commit/4c59cd82f87663a40634523101c7f511afe77e63))
* **core:** Add aggregate group by ([d5eb73b](https://github.com/TriPSs/nestjs-query/commit/d5eb73b9e7a193f664f46486435b7d8d76087b55))
* **core:** Add new `setRelations` to set oneToMany/manyToMany relations ([4c73591](https://github.com/TriPSs/nestjs-query/commit/4c7359168c0713723d18ae2dc302366fd820dc7b))
* **core:** Add type support for nest objects in filter ([cd9d0b5](https://github.com/TriPSs/nestjs-query/commit/cd9d0b524c1f4c384dc9e5ac6baeb5a49bc068e7))
* **core:** Added applySort, applyPaging and applyQuery [#405](https://github.com/TriPSs/nestjs-query/issues/405) ([9f9ae0d](https://github.com/TriPSs/nestjs-query/commit/9f9ae0d0722c685483f1b2e1bd501a0f3df3ff85))
* **core:** added two new filter helpers ([031012e](https://github.com/TriPSs/nestjs-query/commit/031012e96bf99e1eb08c155059fd5106b38e9faf))
* **core:** parallelize queries within relation query service ([b339a2a](https://github.com/TriPSs/nestjs-query/commit/b339a2a9a3d1ad315d92eec67ab31af18617f6ca))
* **core:** refactor null compares and improve tests ([3582ed2](https://github.com/TriPSs/nestjs-query/commit/3582ed2f6b4aa5e3fa78bd9986621b9816566156))
* **core:** Update assemblers to allow transforming create/update dtos ([5085d11](https://github.com/TriPSs/nestjs-query/commit/5085d1193a84396c9016821347c04f0e15eb04da))
* **core:** Update query service decorator to have correct generics ([74dc618](https://github.com/TriPSs/nestjs-query/commit/74dc618b61d1ce5575843accf5ea01066020f073))
* **core:** Update QueryService to allow additional filtering ([474369b](https://github.com/TriPSs/nestjs-query/commit/474369bd46ee82e3c8510f0564019627367d467c))
* **graphql,#1058:** Allow declaration of custom ID scalar type ([fb2ed7a](https://github.com/TriPSs/nestjs-query/commit/fb2ed7aca59d66fa8827522cf81b6e31e77161d3)), closes [#1058](https://github.com/TriPSs/nestjs-query/issues/1058)
* **graphql,connection:** Add totalCount to connections ([ed1e84a](https://github.com/TriPSs/nestjs-query/commit/ed1e84a2feb6f89c3b270fcbc1d0eaf6aec5e575))
* **graphql,core:** Add support for custom services and assemblers ([85e8658](https://github.com/TriPSs/nestjs-query/commit/85e8658c6acd495233cabb576c3458afcb8fff12))
* **graphql:** Add graphql module ([282c421](https://github.com/TriPSs/nestjs-query/commit/282c421d0e6f67fe750fa6005f6cb7d960c8fbd0))
* **graphql:** Add graphql subscriptions ([5dc987f](https://github.com/TriPSs/nestjs-query/commit/5dc987f435e0680192313e208359839f9c21d70b))
* **graphql:** Add keyset connections ([36bdbdd](https://github.com/TriPSs/nestjs-query/commit/36bdbdd9fda8b1db531ceb65c3a7c604c3da23fe))
* **graphql:** Add support for auto-generated federations ([238f641](https://github.com/TriPSs/nestjs-query/commit/238f641967ea6668dfb7bd9034fec732da7fe38b))
* **graphql:** Allow specifying allowed comparisons on filterable fields ([ced2792](https://github.com/TriPSs/nestjs-query/commit/ced27920e5c2278c2a04c027a692e25b3306f6cb))
* **graphql:** basic federation support ([b3e4ae4](https://github.com/TriPSs/nestjs-query/commit/b3e4ae42db2f8b81aa1153be9c943c25465fdd82))
* **mongoose:** Hardening reference support ([107bba0](https://github.com/TriPSs/nestjs-query/commit/107bba040a2b1d423deb4f1e428a43cecab48e79))
* **mongoose:** Switch to native mongoose support ([5cdfa39](https://github.com/TriPSs/nestjs-query/commit/5cdfa39b7d91cf0f8438ef3387a89aac850f4452))
* refactored filter builder to support nested object filters ([1ee8dbf](https://github.com/TriPSs/nestjs-query/commit/1ee8dbf5a0ae1a1258b203da1e68901e2b8d20f8))
* **sequelize:** Initial Sequelize support ([bfcf436](https://github.com/TriPSs/nestjs-query/commit/bfcf4368b96617113c0334cd78a8881e4952eb99))
* **typegoose:** Add typegoose package ([#846](https://github.com/TriPSs/nestjs-query/issues/846)) ([73cf5cd](https://github.com/TriPSs/nestjs-query/commit/73cf5cdbf11496ad3a3ce3f6bb69975510de26e2))


### BREAKING CHANGES

* Nothing special, just want the major version bump as we updated a lot of deps
* Project is moved to NX, deps may still be incorrect



# 1.0.0-alpha.0 (2022-08-26)


### Bug Fixes

* Add consistent sorting for aggregate queries ([4ac7a14](https://github.com/TriPSs/nestjs-query/commit/4ac7a1485c7dcd83569951298606f487608806b1))
* **core:** Fix potential stack overflow with filter comparison ([f498802](https://github.com/TriPSs/nestjs-query/commit/f49880274a32e681d9072253135a8669bec7b3b2))
* **core:** fixed filters merged incorrectly causing unexpected behavior ([588dbe5](https://github.com/TriPSs/nestjs-query/commit/588dbe5ebb166db4c5a35fa8d36a3a0ceb3a0836))
* **core:** Improved workings of `getFilterOmitting` ([28d7e6b](https://github.com/TriPSs/nestjs-query/commit/28d7e6b81f2a63a42331d0d4c5b8fb6ccd3a3d3c))
* **core:** Improved workings of `getFilterOmitting` ([cb06762](https://github.com/TriPSs/nestjs-query/commit/cb067622ae7d754706f50df8c59ac2d711688e40))
* **core:** Look up the proper assembler with inheritance ([8bd22c5](https://github.com/TriPSs/nestjs-query/commit/8bd22c5a40974c9011d0b472dc1ebe1328ba83f6))
* **core:** Use correct return types for decorators ([d328d2b](https://github.com/TriPSs/nestjs-query/commit/d328d2beb8c0ebc3048631a97e5b2023b1891b25))
* **deps:** pin dependencies ([93e9f66](https://github.com/TriPSs/nestjs-query/commit/93e9f664d21e05ed1adc35f1bfafcb6acfe8e536))
* **eslint:** Fix eslint to recognize sub packages ([13fdd2b](https://github.com/TriPSs/nestjs-query/commit/13fdd2b31289dbc80316cbdb5aa32edbe596bad4))
* Fix lint issues ([c3407c0](https://github.com/TriPSs/nestjs-query/commit/c3407c0abfebe2ed6563cf754bab646af124a661))
* **graphql,hooks:** Allow getting hooks from parent classes ([59a0aeb](https://github.com/TriPSs/nestjs-query/commit/59a0aebc3dabd7d23ffde576a94bc588e768efbe))
* **mongoose,typegoose,#881:** Allow string objectId filters ([11098c4](https://github.com/TriPSs/nestjs-query/commit/11098c441de41462fe6c45742bc317f52ea09711)), closes [#881](https://github.com/TriPSs/nestjs-query/issues/881)
* **query-typeorm:** Fixed `getManyToManyOwnerMeta` ([887df20](https://github.com/TriPSs/nestjs-query/commit/887df206eca99a80e5f8b37b5f00711d1ee3ecec))


### chore

* Update third batch of deps + linting rules ([acaff0f](https://github.com/TriPSs/nestjs-query/commit/acaff0fd56918a26cc108d6d98ef71b275400da4))


### Code Refactoring

* Move project to NX ([c70a022](https://github.com/TriPSs/nestjs-query/commit/c70a022671b84025bb10ba3db0a3e5a11ddcccd7))


### Features

* Added support for `withDeleted` in `Relation` decorator ([923d972](https://github.com/TriPSs/nestjs-query/commit/923d972660d06cc76065d90b4a46f8775669ff0b))
* **aggregations,relations,core:** Add relation aggregation to core ([a489588](https://github.com/TriPSs/nestjs-query/commit/a4895881a1e9ff76811b264cc58eeea116b3edfd))
* **aggregations:** Add aggregations interfaces ([d67e733](https://github.com/TriPSs/nestjs-query/commit/d67e73393d2cb8d2f0dc131a8455bb798a270e14))
* **aggregations:** Add aggregations to graphql ([af075d2](https://github.com/TriPSs/nestjs-query/commit/af075d2e93b6abbbfbe32afcc917350f803fadaa))
* allow for passing `useSoftDelete` in resolver opts ([4c59cd8](https://github.com/TriPSs/nestjs-query/commit/4c59cd82f87663a40634523101c7f511afe77e63))
* **core:** Add aggregate group by ([d5eb73b](https://github.com/TriPSs/nestjs-query/commit/d5eb73b9e7a193f664f46486435b7d8d76087b55))
* **core:** Add new `setRelations` to set oneToMany/manyToMany relations ([4c73591](https://github.com/TriPSs/nestjs-query/commit/4c7359168c0713723d18ae2dc302366fd820dc7b))
* **core:** Add type support for nest objects in filter ([cd9d0b5](https://github.com/TriPSs/nestjs-query/commit/cd9d0b524c1f4c384dc9e5ac6baeb5a49bc068e7))
* **core:** Added applySort, applyPaging and applyQuery [#405](https://github.com/TriPSs/nestjs-query/issues/405) ([9f9ae0d](https://github.com/TriPSs/nestjs-query/commit/9f9ae0d0722c685483f1b2e1bd501a0f3df3ff85))
* **core:** added two new filter helpers ([031012e](https://github.com/TriPSs/nestjs-query/commit/031012e96bf99e1eb08c155059fd5106b38e9faf))
* **core:** parallelize queries within relation query service ([b339a2a](https://github.com/TriPSs/nestjs-query/commit/b339a2a9a3d1ad315d92eec67ab31af18617f6ca))
* **core:** refactor null compares and improve tests ([3582ed2](https://github.com/TriPSs/nestjs-query/commit/3582ed2f6b4aa5e3fa78bd9986621b9816566156))
* **core:** Update assemblers to allow transforming create/update dtos ([5085d11](https://github.com/TriPSs/nestjs-query/commit/5085d1193a84396c9016821347c04f0e15eb04da))
* **core:** Update query service decorator to have correct generics ([74dc618](https://github.com/TriPSs/nestjs-query/commit/74dc618b61d1ce5575843accf5ea01066020f073))
* **core:** Update QueryService to allow additional filtering ([474369b](https://github.com/TriPSs/nestjs-query/commit/474369bd46ee82e3c8510f0564019627367d467c))
* **graphql,#1058:** Allow declaration of custom ID scalar type ([fb2ed7a](https://github.com/TriPSs/nestjs-query/commit/fb2ed7aca59d66fa8827522cf81b6e31e77161d3)), closes [#1058](https://github.com/TriPSs/nestjs-query/issues/1058)
* **graphql,connection:** Add totalCount to connections ([ed1e84a](https://github.com/TriPSs/nestjs-query/commit/ed1e84a2feb6f89c3b270fcbc1d0eaf6aec5e575))
* **graphql,core:** Add support for custom services and assemblers ([85e8658](https://github.com/TriPSs/nestjs-query/commit/85e8658c6acd495233cabb576c3458afcb8fff12))
* **graphql:** Add graphql module ([282c421](https://github.com/TriPSs/nestjs-query/commit/282c421d0e6f67fe750fa6005f6cb7d960c8fbd0))
* **graphql:** Add graphql subscriptions ([5dc987f](https://github.com/TriPSs/nestjs-query/commit/5dc987f435e0680192313e208359839f9c21d70b))
* **graphql:** Add keyset connections ([36bdbdd](https://github.com/TriPSs/nestjs-query/commit/36bdbdd9fda8b1db531ceb65c3a7c604c3da23fe))
* **graphql:** Add support for auto-generated federations ([238f641](https://github.com/TriPSs/nestjs-query/commit/238f641967ea6668dfb7bd9034fec732da7fe38b))
* **graphql:** Allow specifying allowed comparisons on filterable fields ([ced2792](https://github.com/TriPSs/nestjs-query/commit/ced27920e5c2278c2a04c027a692e25b3306f6cb))
* **graphql:** basic federation support ([b3e4ae4](https://github.com/TriPSs/nestjs-query/commit/b3e4ae42db2f8b81aa1153be9c943c25465fdd82))
* **mongoose:** Hardening reference support ([107bba0](https://github.com/TriPSs/nestjs-query/commit/107bba040a2b1d423deb4f1e428a43cecab48e79))
* **mongoose:** Switch to native mongoose support ([5cdfa39](https://github.com/TriPSs/nestjs-query/commit/5cdfa39b7d91cf0f8438ef3387a89aac850f4452))
* refactored filter builder to support nested object filters ([1ee8dbf](https://github.com/TriPSs/nestjs-query/commit/1ee8dbf5a0ae1a1258b203da1e68901e2b8d20f8))
* **sequelize:** Initial Sequelize support ([bfcf436](https://github.com/TriPSs/nestjs-query/commit/bfcf4368b96617113c0334cd78a8881e4952eb99))
* **typegoose:** Add typegoose package ([#846](https://github.com/TriPSs/nestjs-query/issues/846)) ([73cf5cd](https://github.com/TriPSs/nestjs-query/commit/73cf5cdbf11496ad3a3ce3f6bb69975510de26e2))


### BREAKING CHANGES

* Nothing special, just want the major version bump as we updated a lot of deps
* Project is moved to NX, deps may still be incorrect



# 1.0.0-alpha.0 (2022-08-26)


### Bug Fixes

* Add consistent sorting for aggregate queries ([4ac7a14](https://github.com/TriPSs/nestjs-query/commit/4ac7a1485c7dcd83569951298606f487608806b1))
* **core:** Fix potential stack overflow with filter comparison ([f498802](https://github.com/TriPSs/nestjs-query/commit/f49880274a32e681d9072253135a8669bec7b3b2))
* **core:** fixed filters merged incorrectly causing unexpected behavior ([588dbe5](https://github.com/TriPSs/nestjs-query/commit/588dbe5ebb166db4c5a35fa8d36a3a0ceb3a0836))
* **core:** Improved workings of `getFilterOmitting` ([28d7e6b](https://github.com/TriPSs/nestjs-query/commit/28d7e6b81f2a63a42331d0d4c5b8fb6ccd3a3d3c))
* **core:** Improved workings of `getFilterOmitting` ([cb06762](https://github.com/TriPSs/nestjs-query/commit/cb067622ae7d754706f50df8c59ac2d711688e40))
* **core:** Look up the proper assembler with inheritance ([8bd22c5](https://github.com/TriPSs/nestjs-query/commit/8bd22c5a40974c9011d0b472dc1ebe1328ba83f6))
* **core:** Use correct return types for decorators ([d328d2b](https://github.com/TriPSs/nestjs-query/commit/d328d2beb8c0ebc3048631a97e5b2023b1891b25))
* **deps:** pin dependencies ([93e9f66](https://github.com/TriPSs/nestjs-query/commit/93e9f664d21e05ed1adc35f1bfafcb6acfe8e536))
* **eslint:** Fix eslint to recognize sub packages ([13fdd2b](https://github.com/TriPSs/nestjs-query/commit/13fdd2b31289dbc80316cbdb5aa32edbe596bad4))
* Fix lint issues ([c3407c0](https://github.com/TriPSs/nestjs-query/commit/c3407c0abfebe2ed6563cf754bab646af124a661))
* **graphql,hooks:** Allow getting hooks from parent classes ([59a0aeb](https://github.com/TriPSs/nestjs-query/commit/59a0aebc3dabd7d23ffde576a94bc588e768efbe))
* **mongoose,typegoose,#881:** Allow string objectId filters ([11098c4](https://github.com/TriPSs/nestjs-query/commit/11098c441de41462fe6c45742bc317f52ea09711)), closes [#881](https://github.com/TriPSs/nestjs-query/issues/881)
* **query-typeorm:** Fixed `getManyToManyOwnerMeta` ([887df20](https://github.com/TriPSs/nestjs-query/commit/887df206eca99a80e5f8b37b5f00711d1ee3ecec))


### chore

* Update third batch of deps + linting rules ([acaff0f](https://github.com/TriPSs/nestjs-query/commit/acaff0fd56918a26cc108d6d98ef71b275400da4))


### Code Refactoring

* Move project to NX ([c70a022](https://github.com/TriPSs/nestjs-query/commit/c70a022671b84025bb10ba3db0a3e5a11ddcccd7))


### Features

* Added support for `withDeleted` in `Relation` decorator ([923d972](https://github.com/TriPSs/nestjs-query/commit/923d972660d06cc76065d90b4a46f8775669ff0b))
* **aggregations,relations,core:** Add relation aggregation to core ([a489588](https://github.com/TriPSs/nestjs-query/commit/a4895881a1e9ff76811b264cc58eeea116b3edfd))
* **aggregations:** Add aggregations interfaces ([d67e733](https://github.com/TriPSs/nestjs-query/commit/d67e73393d2cb8d2f0dc131a8455bb798a270e14))
* **aggregations:** Add aggregations to graphql ([af075d2](https://github.com/TriPSs/nestjs-query/commit/af075d2e93b6abbbfbe32afcc917350f803fadaa))
* allow for passing `useSoftDelete` in resolver opts ([4c59cd8](https://github.com/TriPSs/nestjs-query/commit/4c59cd82f87663a40634523101c7f511afe77e63))
* **core:** Add aggregate group by ([d5eb73b](https://github.com/TriPSs/nestjs-query/commit/d5eb73b9e7a193f664f46486435b7d8d76087b55))
* **core:** Add new `setRelations` to set oneToMany/manyToMany relations ([4c73591](https://github.com/TriPSs/nestjs-query/commit/4c7359168c0713723d18ae2dc302366fd820dc7b))
* **core:** Add type support for nest objects in filter ([cd9d0b5](https://github.com/TriPSs/nestjs-query/commit/cd9d0b524c1f4c384dc9e5ac6baeb5a49bc068e7))
* **core:** Added applySort, applyPaging and applyQuery [#405](https://github.com/TriPSs/nestjs-query/issues/405) ([9f9ae0d](https://github.com/TriPSs/nestjs-query/commit/9f9ae0d0722c685483f1b2e1bd501a0f3df3ff85))
* **core:** added two new filter helpers ([031012e](https://github.com/TriPSs/nestjs-query/commit/031012e96bf99e1eb08c155059fd5106b38e9faf))
* **core:** parallelize queries within relation query service ([b339a2a](https://github.com/TriPSs/nestjs-query/commit/b339a2a9a3d1ad315d92eec67ab31af18617f6ca))
* **core:** refactor null compares and improve tests ([3582ed2](https://github.com/TriPSs/nestjs-query/commit/3582ed2f6b4aa5e3fa78bd9986621b9816566156))
* **core:** Update assemblers to allow transforming create/update dtos ([5085d11](https://github.com/TriPSs/nestjs-query/commit/5085d1193a84396c9016821347c04f0e15eb04da))
* **core:** Update query service decorator to have correct generics ([74dc618](https://github.com/TriPSs/nestjs-query/commit/74dc618b61d1ce5575843accf5ea01066020f073))
* **core:** Update QueryService to allow additional filtering ([474369b](https://github.com/TriPSs/nestjs-query/commit/474369bd46ee82e3c8510f0564019627367d467c))
* **graphql,#1058:** Allow declaration of custom ID scalar type ([fb2ed7a](https://github.com/TriPSs/nestjs-query/commit/fb2ed7aca59d66fa8827522cf81b6e31e77161d3)), closes [#1058](https://github.com/TriPSs/nestjs-query/issues/1058)
* **graphql,connection:** Add totalCount to connections ([ed1e84a](https://github.com/TriPSs/nestjs-query/commit/ed1e84a2feb6f89c3b270fcbc1d0eaf6aec5e575))
* **graphql,core:** Add support for custom services and assemblers ([85e8658](https://github.com/TriPSs/nestjs-query/commit/85e8658c6acd495233cabb576c3458afcb8fff12))
* **graphql:** Add graphql module ([282c421](https://github.com/TriPSs/nestjs-query/commit/282c421d0e6f67fe750fa6005f6cb7d960c8fbd0))
* **graphql:** Add graphql subscriptions ([5dc987f](https://github.com/TriPSs/nestjs-query/commit/5dc987f435e0680192313e208359839f9c21d70b))
* **graphql:** Add keyset connections ([36bdbdd](https://github.com/TriPSs/nestjs-query/commit/36bdbdd9fda8b1db531ceb65c3a7c604c3da23fe))
* **graphql:** Add support for auto-generated federations ([238f641](https://github.com/TriPSs/nestjs-query/commit/238f641967ea6668dfb7bd9034fec732da7fe38b))
* **graphql:** Allow specifying allowed comparisons on filterable fields ([ced2792](https://github.com/TriPSs/nestjs-query/commit/ced27920e5c2278c2a04c027a692e25b3306f6cb))
* **graphql:** basic federation support ([b3e4ae4](https://github.com/TriPSs/nestjs-query/commit/b3e4ae42db2f8b81aa1153be9c943c25465fdd82))
* **mongoose:** Hardening reference support ([107bba0](https://github.com/TriPSs/nestjs-query/commit/107bba040a2b1d423deb4f1e428a43cecab48e79))
* **mongoose:** Switch to native mongoose support ([5cdfa39](https://github.com/TriPSs/nestjs-query/commit/5cdfa39b7d91cf0f8438ef3387a89aac850f4452))
* refactored filter builder to support nested object filters ([1ee8dbf](https://github.com/TriPSs/nestjs-query/commit/1ee8dbf5a0ae1a1258b203da1e68901e2b8d20f8))
* **sequelize:** Initial Sequelize support ([bfcf436](https://github.com/TriPSs/nestjs-query/commit/bfcf4368b96617113c0334cd78a8881e4952eb99))
* **typegoose:** Add typegoose package ([#846](https://github.com/TriPSs/nestjs-query/issues/846)) ([73cf5cd](https://github.com/TriPSs/nestjs-query/commit/73cf5cdbf11496ad3a3ce3f6bb69975510de26e2))


### BREAKING CHANGES

* Nothing special, just want the major version bump as we updated a lot of deps
* Project is moved to NX, deps may still be incorrect



# 1.0.0-alpha.0 (2022-08-26)


### Bug Fixes

* Add consistent sorting for aggregate queries ([4ac7a14](https://github.com/TriPSs/nestjs-query/commit/4ac7a1485c7dcd83569951298606f487608806b1))
* **core:** Fix potential stack overflow with filter comparison ([f498802](https://github.com/TriPSs/nestjs-query/commit/f49880274a32e681d9072253135a8669bec7b3b2))
* **core:** fixed filters merged incorrectly causing unexpected behavior ([588dbe5](https://github.com/TriPSs/nestjs-query/commit/588dbe5ebb166db4c5a35fa8d36a3a0ceb3a0836))
* **core:** Improved workings of `getFilterOmitting` ([28d7e6b](https://github.com/TriPSs/nestjs-query/commit/28d7e6b81f2a63a42331d0d4c5b8fb6ccd3a3d3c))
* **core:** Improved workings of `getFilterOmitting` ([cb06762](https://github.com/TriPSs/nestjs-query/commit/cb067622ae7d754706f50df8c59ac2d711688e40))
* **core:** Look up the proper assembler with inheritance ([8bd22c5](https://github.com/TriPSs/nestjs-query/commit/8bd22c5a40974c9011d0b472dc1ebe1328ba83f6))
* **core:** Use correct return types for decorators ([d328d2b](https://github.com/TriPSs/nestjs-query/commit/d328d2beb8c0ebc3048631a97e5b2023b1891b25))
* **deps:** pin dependencies ([93e9f66](https://github.com/TriPSs/nestjs-query/commit/93e9f664d21e05ed1adc35f1bfafcb6acfe8e536))
* **eslint:** Fix eslint to recognize sub packages ([13fdd2b](https://github.com/TriPSs/nestjs-query/commit/13fdd2b31289dbc80316cbdb5aa32edbe596bad4))
* Fix lint issues ([c3407c0](https://github.com/TriPSs/nestjs-query/commit/c3407c0abfebe2ed6563cf754bab646af124a661))
* **graphql,hooks:** Allow getting hooks from parent classes ([59a0aeb](https://github.com/TriPSs/nestjs-query/commit/59a0aebc3dabd7d23ffde576a94bc588e768efbe))
* **mongoose,typegoose,#881:** Allow string objectId filters ([11098c4](https://github.com/TriPSs/nestjs-query/commit/11098c441de41462fe6c45742bc317f52ea09711)), closes [#881](https://github.com/TriPSs/nestjs-query/issues/881)
* **query-typeorm:** Fixed `getManyToManyOwnerMeta` ([887df20](https://github.com/TriPSs/nestjs-query/commit/887df206eca99a80e5f8b37b5f00711d1ee3ecec))


### chore

* Update third batch of deps + linting rules ([acaff0f](https://github.com/TriPSs/nestjs-query/commit/acaff0fd56918a26cc108d6d98ef71b275400da4))


### Code Refactoring

* Move project to NX ([c70a022](https://github.com/TriPSs/nestjs-query/commit/c70a022671b84025bb10ba3db0a3e5a11ddcccd7))


### Features

* Added support for `withDeleted` in `Relation` decorator ([923d972](https://github.com/TriPSs/nestjs-query/commit/923d972660d06cc76065d90b4a46f8775669ff0b))
* **aggregations,relations,core:** Add relation aggregation to core ([a489588](https://github.com/TriPSs/nestjs-query/commit/a4895881a1e9ff76811b264cc58eeea116b3edfd))
* **aggregations:** Add aggregations interfaces ([d67e733](https://github.com/TriPSs/nestjs-query/commit/d67e73393d2cb8d2f0dc131a8455bb798a270e14))
* **aggregations:** Add aggregations to graphql ([af075d2](https://github.com/TriPSs/nestjs-query/commit/af075d2e93b6abbbfbe32afcc917350f803fadaa))
* allow for passing `useSoftDelete` in resolver opts ([4c59cd8](https://github.com/TriPSs/nestjs-query/commit/4c59cd82f87663a40634523101c7f511afe77e63))
* **core:** Add aggregate group by ([d5eb73b](https://github.com/TriPSs/nestjs-query/commit/d5eb73b9e7a193f664f46486435b7d8d76087b55))
* **core:** Add new `setRelations` to set oneToMany/manyToMany relations ([4c73591](https://github.com/TriPSs/nestjs-query/commit/4c7359168c0713723d18ae2dc302366fd820dc7b))
* **core:** Add type support for nest objects in filter ([cd9d0b5](https://github.com/TriPSs/nestjs-query/commit/cd9d0b524c1f4c384dc9e5ac6baeb5a49bc068e7))
* **core:** Added applySort, applyPaging and applyQuery [#405](https://github.com/TriPSs/nestjs-query/issues/405) ([9f9ae0d](https://github.com/TriPSs/nestjs-query/commit/9f9ae0d0722c685483f1b2e1bd501a0f3df3ff85))
* **core:** added two new filter helpers ([031012e](https://github.com/TriPSs/nestjs-query/commit/031012e96bf99e1eb08c155059fd5106b38e9faf))
* **core:** parallelize queries within relation query service ([b339a2a](https://github.com/TriPSs/nestjs-query/commit/b339a2a9a3d1ad315d92eec67ab31af18617f6ca))
* **core:** refactor null compares and improve tests ([3582ed2](https://github.com/TriPSs/nestjs-query/commit/3582ed2f6b4aa5e3fa78bd9986621b9816566156))
* **core:** Update assemblers to allow transforming create/update dtos ([5085d11](https://github.com/TriPSs/nestjs-query/commit/5085d1193a84396c9016821347c04f0e15eb04da))
* **core:** Update query service decorator to have correct generics ([74dc618](https://github.com/TriPSs/nestjs-query/commit/74dc618b61d1ce5575843accf5ea01066020f073))
* **core:** Update QueryService to allow additional filtering ([474369b](https://github.com/TriPSs/nestjs-query/commit/474369bd46ee82e3c8510f0564019627367d467c))
* **graphql,#1058:** Allow declaration of custom ID scalar type ([fb2ed7a](https://github.com/TriPSs/nestjs-query/commit/fb2ed7aca59d66fa8827522cf81b6e31e77161d3)), closes [#1058](https://github.com/TriPSs/nestjs-query/issues/1058)
* **graphql,connection:** Add totalCount to connections ([ed1e84a](https://github.com/TriPSs/nestjs-query/commit/ed1e84a2feb6f89c3b270fcbc1d0eaf6aec5e575))
* **graphql,core:** Add support for custom services and assemblers ([85e8658](https://github.com/TriPSs/nestjs-query/commit/85e8658c6acd495233cabb576c3458afcb8fff12))
* **graphql:** Add graphql module ([282c421](https://github.com/TriPSs/nestjs-query/commit/282c421d0e6f67fe750fa6005f6cb7d960c8fbd0))
* **graphql:** Add graphql subscriptions ([5dc987f](https://github.com/TriPSs/nestjs-query/commit/5dc987f435e0680192313e208359839f9c21d70b))
* **graphql:** Add keyset connections ([36bdbdd](https://github.com/TriPSs/nestjs-query/commit/36bdbdd9fda8b1db531ceb65c3a7c604c3da23fe))
* **graphql:** Add support for auto-generated federations ([238f641](https://github.com/TriPSs/nestjs-query/commit/238f641967ea6668dfb7bd9034fec732da7fe38b))
* **graphql:** Allow specifying allowed comparisons on filterable fields ([ced2792](https://github.com/TriPSs/nestjs-query/commit/ced27920e5c2278c2a04c027a692e25b3306f6cb))
* **graphql:** basic federation support ([b3e4ae4](https://github.com/TriPSs/nestjs-query/commit/b3e4ae42db2f8b81aa1153be9c943c25465fdd82))
* **mongoose:** Hardening reference support ([107bba0](https://github.com/TriPSs/nestjs-query/commit/107bba040a2b1d423deb4f1e428a43cecab48e79))
* **mongoose:** Switch to native mongoose support ([5cdfa39](https://github.com/TriPSs/nestjs-query/commit/5cdfa39b7d91cf0f8438ef3387a89aac850f4452))
* refactored filter builder to support nested object filters ([1ee8dbf](https://github.com/TriPSs/nestjs-query/commit/1ee8dbf5a0ae1a1258b203da1e68901e2b8d20f8))
* **sequelize:** Initial Sequelize support ([bfcf436](https://github.com/TriPSs/nestjs-query/commit/bfcf4368b96617113c0334cd78a8881e4952eb99))
* **typegoose:** Add typegoose package ([#846](https://github.com/TriPSs/nestjs-query/issues/846)) ([73cf5cd](https://github.com/TriPSs/nestjs-query/commit/73cf5cdbf11496ad3a3ce3f6bb69975510de26e2))


### BREAKING CHANGES

* Nothing special, just want the major version bump as we updated a lot of deps
* Project is moved to NX, deps may still be incorrect
