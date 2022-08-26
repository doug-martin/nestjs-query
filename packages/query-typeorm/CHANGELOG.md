 
# 1.0.0-alpha.0 (2022-08-26)


### Bug Fixes

* Add consistent sorting for aggregate queries ([4ac7a14](https://github.com/TriPSs/nestjs-query/commit/4ac7a1485c7dcd83569951298606f487608806b1))
* **deps:** pin dependencies ([93e9f66](https://github.com/TriPSs/nestjs-query/commit/93e9f664d21e05ed1adc35f1bfafcb6acfe8e536))
* **deps:** update dependency uuid to v8.3.1 ([a2b7555](https://github.com/TriPSs/nestjs-query/commit/a2b7555c1186e48999d44aa8af9b792f32b18b7e))
* **deps:** update dependency uuid to v8.3.2 ([289f1ed](https://github.com/TriPSs/nestjs-query/commit/289f1ed5610781792d3c1efa5492376095084ac0))
* **eslint:** Fix eslint to recognize sub packages ([13fdd2b](https://github.com/TriPSs/nestjs-query/commit/13fdd2b31289dbc80316cbdb5aa32edbe596bad4))
* **filters:** Fix bug with incorect parameters in filter ([6ada4f4](https://github.com/TriPSs/nestjs-query/commit/6ada4f4a12633d41c60de9540dfc28ed0985ca62))
* **filters:** Fix bug with incorect parameters in filters ([9f4e93b](https://github.com/TriPSs/nestjs-query/commit/9f4e93b7726d85cb4febe86d2caf941dc957463a))
* **query-typeorm:** Fixed `deleteMany` throwing error when called with filter that contained relations ([53c6c6b](https://github.com/TriPSs/nestjs-query/commit/53c6c6b9f0533f311d0de56d78a1a95a61713438))
* **query-typeorm:** Fixed `deleteMany` throwing error when called with filter that contained relations ([6f8ac0b](https://github.com/TriPSs/nestjs-query/commit/6f8ac0b7960447e903c40635990addb66b46348c))
* **query-typeorm:** Fixed `getManyToManyOwnerMeta` ([887df20](https://github.com/TriPSs/nestjs-query/commit/887df206eca99a80e5f8b37b5f00711d1ee3ecec))
* **query-typeorm:** Fixed `updateMany` not supporting relations ([93ef5a9](https://github.com/TriPSs/nestjs-query/commit/93ef5a9002b1c2206a39770d6f8f59c5bfe26ecc))
* **query-typeorm:** Fixed group by for aggregated date fields ([7ffeaf6](https://github.com/TriPSs/nestjs-query/commit/7ffeaf6b9e400eb027298a3870712eb7124c88bb))
* **query-typeorm:** import jest-extended into typeorm query service ([f539b29](https://github.com/TriPSs/nestjs-query/commit/f539b29fad60c070e8736f872d547fd498eb3c4f))
* **query-typeorm:** Use `qb` directly when adding additional fields ([5843ac4](https://github.com/TriPSs/nestjs-query/commit/5843ac4a7f0542efa9d33d1798e7ac3c2eaf16ca))
* **tests:** fix jest-extended typings and eslint problems ([6af8af1](https://github.com/TriPSs/nestjs-query/commit/6af8af13a33faaa1585561e7b426b125a6368b6b))
* **typeorm, #954:** Filtering on relations with pagination  ([#977](https://github.com/TriPSs/nestjs-query/issues/977)) ([f5a6374](https://github.com/TriPSs/nestjs-query/commit/f5a6374f6e22470f63ef6257f7271c818ed09321)), closes [#954](https://github.com/TriPSs/nestjs-query/issues/954) [#954](https://github.com/TriPSs/nestjs-query/issues/954) [#954](https://github.com/TriPSs/nestjs-query/issues/954) [#954](https://github.com/TriPSs/nestjs-query/issues/954)
* **typeorm,#493:** Fix uni-directional relation SQL ([7887b8c](https://github.com/TriPSs/nestjs-query/commit/7887b8c94516194840df03139fecd0d5a0f38f65))
* **typeorm,#895:** Wrap all OR and AND expressions in brackets ([838ab16](https://github.com/TriPSs/nestjs-query/commit/838ab16befe7a53f5fb11e84624c3b30811f61c6)), closes [#895](https://github.com/TriPSs/nestjs-query/issues/895)
* **typeorm:** Allow using string based typeorm relations ([55c157d](https://github.com/TriPSs/nestjs-query/commit/55c157dbea9ce8c1186a2c2ea17f847857fd2226))
* **typeorm:** Ensure record is entity instance when saving ([3cdbbaf](https://github.com/TriPSs/nestjs-query/commit/3cdbbaff11b18bcc5e6fd29fd182e2bd66b14f17)), closes [#380](https://github.com/TriPSs/nestjs-query/issues/380)
* **typeorm:** Fix import path in relation service [#363](https://github.com/TriPSs/nestjs-query/issues/363) ([0e6d484](https://github.com/TriPSs/nestjs-query/commit/0e6d484920960ed1966360a89af979230667b5f7))
* **typeorm:** fix unit tests after fix filters bug ([5f50419](https://github.com/TriPSs/nestjs-query/commit/5f5041906694ae7c4aa799f52049d0981b97ccfc))
* **typeorm:** revert uneeded change to test entity ([86f7fd9](https://github.com/TriPSs/nestjs-query/commit/86f7fd9abb101eb40af2cf66009d50cb8c173eea))
* **type:** Pin dev dependencies ([442db4c](https://github.com/TriPSs/nestjs-query/commit/442db4cd9b9d48d0c6a20209f0b44c4a314660ac))


### chore

* Update third batch of deps + linting rules ([acaff0f](https://github.com/TriPSs/nestjs-query/commit/acaff0fd56918a26cc108d6d98ef71b275400da4))


### Code Refactoring

* Move project to NX ([c70a022](https://github.com/TriPSs/nestjs-query/commit/c70a022671b84025bb10ba3db0a3e5a11ddcccd7))


### Features

* Added support for `withDeleted` in `Relation` decorator ([923d972](https://github.com/TriPSs/nestjs-query/commit/923d972660d06cc76065d90b4a46f8775669ff0b))
* **aggregations,typeorm:** Add relation aggregation to typeorm ([2bf35a9](https://github.com/TriPSs/nestjs-query/commit/2bf35a92ce80b1f3026fd87cb62cad17eb6eff03))
* **aggregations:** Add aggregations to graphql ([af075d2](https://github.com/TriPSs/nestjs-query/commit/af075d2e93b6abbbfbe32afcc917350f803fadaa))
* **aggretations:** Add aggregations support to typeorm ([7233c23](https://github.com/TriPSs/nestjs-query/commit/7233c2397d0ac332e5209ab87ae62f5f555609d6))
* allow for passing `useSoftDelete` in resolver opts ([4c59cd8](https://github.com/TriPSs/nestjs-query/commit/4c59cd82f87663a40634523101c7f511afe77e63))
* **graphql,connection:** Add totalCount to connections ([ed1e84a](https://github.com/TriPSs/nestjs-query/commit/ed1e84a2feb6f89c3b270fcbc1d0eaf6aec5e575))
* **graphql:** Add graphql module ([282c421](https://github.com/TriPSs/nestjs-query/commit/282c421d0e6f67fe750fa6005f6cb7d960c8fbd0))
* **graphql:** Allow specifying allowed comparisons on filterable fields ([ced2792](https://github.com/TriPSs/nestjs-query/commit/ced27920e5c2278c2a04c027a692e25b3306f6cb))
* **query-typeorm:** allow deeply nested filters ([0bd6b76](https://github.com/TriPSs/nestjs-query/commit/0bd6b76c4dbd876df7f9a991803843405d24fdb9))
* **typegoose:** Add typegoose package ([#846](https://github.com/TriPSs/nestjs-query/issues/846)) ([73cf5cd](https://github.com/TriPSs/nestjs-query/commit/73cf5cdbf11496ad3a3ce3f6bb69975510de26e2))
* **typeorm:** Add additional filter options to QueryService ([64241dc](https://github.com/TriPSs/nestjs-query/commit/64241dc9c4565c3bb2d4f168c837578bd706c48c))
* **typeorm:** Add support for filtering on relations ([aa8788c](https://github.com/TriPSs/nestjs-query/commit/aa8788cbbc0c95465e1633b57ca48c91b160038a))
* **typeorm:** Add support for soft deletes ([2ab42fa](https://github.com/TriPSs/nestjs-query/commit/2ab42faee2802abae4d8496e2529b8eb23860ed4))
* **typeorm:** Implement `setRelations` to set many relations ([d1109b7](https://github.com/TriPSs/nestjs-query/commit/d1109b70f961cf59d7cbc8b8a85c401980a2b6c4))
* **typeorm:** Switch to use unioned queries for relations ([327c676](https://github.com/TriPSs/nestjs-query/commit/327c6760e3e1a7db6bb0f872928d0502345c925f))
* **typeorm:** Update to support new aggregate with groupBy ([e2a4f30](https://github.com/TriPSs/nestjs-query/commit/e2a4f3066834ae7fddf0239ab647a0a9de667149))


### Performance Improvements

* **query-typeorm:** Rewrote `batchQueryRelations` to use one query ([c7aa255](https://github.com/TriPSs/nestjs-query/commit/c7aa255e11e86bf13e87e7d3cd26ef34d556bb1a))
* **query-typeorm:** Use existing join alias if there is one ([419d5b4](https://github.com/TriPSs/nestjs-query/commit/419d5b4f23efa111f698620e118b7168a1a594bd))


### BREAKING CHANGES

* Nothing special, just want the major version bump as we updated a lot of deps
* Project is moved to NX, deps may still be incorrect



# 1.0.0-alpha.0 (2022-08-26)


### Bug Fixes

* Add consistent sorting for aggregate queries ([4ac7a14](https://github.com/TriPSs/nestjs-query/commit/4ac7a1485c7dcd83569951298606f487608806b1))
* **deps:** pin dependencies ([93e9f66](https://github.com/TriPSs/nestjs-query/commit/93e9f664d21e05ed1adc35f1bfafcb6acfe8e536))
* **deps:** update dependency uuid to v8.3.1 ([a2b7555](https://github.com/TriPSs/nestjs-query/commit/a2b7555c1186e48999d44aa8af9b792f32b18b7e))
* **deps:** update dependency uuid to v8.3.2 ([289f1ed](https://github.com/TriPSs/nestjs-query/commit/289f1ed5610781792d3c1efa5492376095084ac0))
* **eslint:** Fix eslint to recognize sub packages ([13fdd2b](https://github.com/TriPSs/nestjs-query/commit/13fdd2b31289dbc80316cbdb5aa32edbe596bad4))
* **filters:** Fix bug with incorect parameters in filter ([6ada4f4](https://github.com/TriPSs/nestjs-query/commit/6ada4f4a12633d41c60de9540dfc28ed0985ca62))
* **filters:** Fix bug with incorect parameters in filters ([9f4e93b](https://github.com/TriPSs/nestjs-query/commit/9f4e93b7726d85cb4febe86d2caf941dc957463a))
* **query-typeorm:** Fixed `deleteMany` throwing error when called with filter that contained relations ([53c6c6b](https://github.com/TriPSs/nestjs-query/commit/53c6c6b9f0533f311d0de56d78a1a95a61713438))
* **query-typeorm:** Fixed `deleteMany` throwing error when called with filter that contained relations ([6f8ac0b](https://github.com/TriPSs/nestjs-query/commit/6f8ac0b7960447e903c40635990addb66b46348c))
* **query-typeorm:** Fixed `getManyToManyOwnerMeta` ([887df20](https://github.com/TriPSs/nestjs-query/commit/887df206eca99a80e5f8b37b5f00711d1ee3ecec))
* **query-typeorm:** Fixed `updateMany` not supporting relations ([93ef5a9](https://github.com/TriPSs/nestjs-query/commit/93ef5a9002b1c2206a39770d6f8f59c5bfe26ecc))
* **query-typeorm:** Fixed group by for aggregated date fields ([7ffeaf6](https://github.com/TriPSs/nestjs-query/commit/7ffeaf6b9e400eb027298a3870712eb7124c88bb))
* **query-typeorm:** import jest-extended into typeorm query service ([f539b29](https://github.com/TriPSs/nestjs-query/commit/f539b29fad60c070e8736f872d547fd498eb3c4f))
* **query-typeorm:** Use `qb` directly when adding additional fields ([5843ac4](https://github.com/TriPSs/nestjs-query/commit/5843ac4a7f0542efa9d33d1798e7ac3c2eaf16ca))
* **tests:** fix jest-extended typings and eslint problems ([6af8af1](https://github.com/TriPSs/nestjs-query/commit/6af8af13a33faaa1585561e7b426b125a6368b6b))
* **typeorm, #954:** Filtering on relations with pagination  ([#977](https://github.com/TriPSs/nestjs-query/issues/977)) ([f5a6374](https://github.com/TriPSs/nestjs-query/commit/f5a6374f6e22470f63ef6257f7271c818ed09321)), closes [#954](https://github.com/TriPSs/nestjs-query/issues/954) [#954](https://github.com/TriPSs/nestjs-query/issues/954) [#954](https://github.com/TriPSs/nestjs-query/issues/954) [#954](https://github.com/TriPSs/nestjs-query/issues/954)
* **typeorm,#493:** Fix uni-directional relation SQL ([7887b8c](https://github.com/TriPSs/nestjs-query/commit/7887b8c94516194840df03139fecd0d5a0f38f65))
* **typeorm,#895:** Wrap all OR and AND expressions in brackets ([838ab16](https://github.com/TriPSs/nestjs-query/commit/838ab16befe7a53f5fb11e84624c3b30811f61c6)), closes [#895](https://github.com/TriPSs/nestjs-query/issues/895)
* **typeorm:** Allow using string based typeorm relations ([55c157d](https://github.com/TriPSs/nestjs-query/commit/55c157dbea9ce8c1186a2c2ea17f847857fd2226))
* **typeorm:** Ensure record is entity instance when saving ([3cdbbaf](https://github.com/TriPSs/nestjs-query/commit/3cdbbaff11b18bcc5e6fd29fd182e2bd66b14f17)), closes [#380](https://github.com/TriPSs/nestjs-query/issues/380)
* **typeorm:** Fix import path in relation service [#363](https://github.com/TriPSs/nestjs-query/issues/363) ([0e6d484](https://github.com/TriPSs/nestjs-query/commit/0e6d484920960ed1966360a89af979230667b5f7))
* **typeorm:** fix unit tests after fix filters bug ([5f50419](https://github.com/TriPSs/nestjs-query/commit/5f5041906694ae7c4aa799f52049d0981b97ccfc))
* **typeorm:** revert uneeded change to test entity ([86f7fd9](https://github.com/TriPSs/nestjs-query/commit/86f7fd9abb101eb40af2cf66009d50cb8c173eea))
* **type:** Pin dev dependencies ([442db4c](https://github.com/TriPSs/nestjs-query/commit/442db4cd9b9d48d0c6a20209f0b44c4a314660ac))


### chore

* Update third batch of deps + linting rules ([acaff0f](https://github.com/TriPSs/nestjs-query/commit/acaff0fd56918a26cc108d6d98ef71b275400da4))


### Code Refactoring

* Move project to NX ([c70a022](https://github.com/TriPSs/nestjs-query/commit/c70a022671b84025bb10ba3db0a3e5a11ddcccd7))


### Features

* Added support for `withDeleted` in `Relation` decorator ([923d972](https://github.com/TriPSs/nestjs-query/commit/923d972660d06cc76065d90b4a46f8775669ff0b))
* **aggregations,typeorm:** Add relation aggregation to typeorm ([2bf35a9](https://github.com/TriPSs/nestjs-query/commit/2bf35a92ce80b1f3026fd87cb62cad17eb6eff03))
* **aggregations:** Add aggregations to graphql ([af075d2](https://github.com/TriPSs/nestjs-query/commit/af075d2e93b6abbbfbe32afcc917350f803fadaa))
* **aggretations:** Add aggregations support to typeorm ([7233c23](https://github.com/TriPSs/nestjs-query/commit/7233c2397d0ac332e5209ab87ae62f5f555609d6))
* allow for passing `useSoftDelete` in resolver opts ([4c59cd8](https://github.com/TriPSs/nestjs-query/commit/4c59cd82f87663a40634523101c7f511afe77e63))
* **graphql,connection:** Add totalCount to connections ([ed1e84a](https://github.com/TriPSs/nestjs-query/commit/ed1e84a2feb6f89c3b270fcbc1d0eaf6aec5e575))
* **graphql:** Add graphql module ([282c421](https://github.com/TriPSs/nestjs-query/commit/282c421d0e6f67fe750fa6005f6cb7d960c8fbd0))
* **graphql:** Allow specifying allowed comparisons on filterable fields ([ced2792](https://github.com/TriPSs/nestjs-query/commit/ced27920e5c2278c2a04c027a692e25b3306f6cb))
* **query-typeorm:** allow deeply nested filters ([0bd6b76](https://github.com/TriPSs/nestjs-query/commit/0bd6b76c4dbd876df7f9a991803843405d24fdb9))
* **typegoose:** Add typegoose package ([#846](https://github.com/TriPSs/nestjs-query/issues/846)) ([73cf5cd](https://github.com/TriPSs/nestjs-query/commit/73cf5cdbf11496ad3a3ce3f6bb69975510de26e2))
* **typeorm:** Add additional filter options to QueryService ([64241dc](https://github.com/TriPSs/nestjs-query/commit/64241dc9c4565c3bb2d4f168c837578bd706c48c))
* **typeorm:** Add support for filtering on relations ([aa8788c](https://github.com/TriPSs/nestjs-query/commit/aa8788cbbc0c95465e1633b57ca48c91b160038a))
* **typeorm:** Add support for soft deletes ([2ab42fa](https://github.com/TriPSs/nestjs-query/commit/2ab42faee2802abae4d8496e2529b8eb23860ed4))
* **typeorm:** Implement `setRelations` to set many relations ([d1109b7](https://github.com/TriPSs/nestjs-query/commit/d1109b70f961cf59d7cbc8b8a85c401980a2b6c4))
* **typeorm:** Switch to use unioned queries for relations ([327c676](https://github.com/TriPSs/nestjs-query/commit/327c6760e3e1a7db6bb0f872928d0502345c925f))
* **typeorm:** Update to support new aggregate with groupBy ([e2a4f30](https://github.com/TriPSs/nestjs-query/commit/e2a4f3066834ae7fddf0239ab647a0a9de667149))


### Performance Improvements

* **query-typeorm:** Rewrote `batchQueryRelations` to use one query ([c7aa255](https://github.com/TriPSs/nestjs-query/commit/c7aa255e11e86bf13e87e7d3cd26ef34d556bb1a))
* **query-typeorm:** Use existing join alias if there is one ([419d5b4](https://github.com/TriPSs/nestjs-query/commit/419d5b4f23efa111f698620e118b7168a1a594bd))


### BREAKING CHANGES

* Nothing special, just want the major version bump as we updated a lot of deps
* Project is moved to NX, deps may still be incorrect



# 1.0.0-alpha.0 (2022-08-26)


### Bug Fixes

* Add consistent sorting for aggregate queries ([4ac7a14](https://github.com/TriPSs/nestjs-query/commit/4ac7a1485c7dcd83569951298606f487608806b1))
* **deps:** pin dependencies ([93e9f66](https://github.com/TriPSs/nestjs-query/commit/93e9f664d21e05ed1adc35f1bfafcb6acfe8e536))
* **deps:** update dependency uuid to v8.3.1 ([a2b7555](https://github.com/TriPSs/nestjs-query/commit/a2b7555c1186e48999d44aa8af9b792f32b18b7e))
* **deps:** update dependency uuid to v8.3.2 ([289f1ed](https://github.com/TriPSs/nestjs-query/commit/289f1ed5610781792d3c1efa5492376095084ac0))
* **eslint:** Fix eslint to recognize sub packages ([13fdd2b](https://github.com/TriPSs/nestjs-query/commit/13fdd2b31289dbc80316cbdb5aa32edbe596bad4))
* **filters:** Fix bug with incorect parameters in filter ([6ada4f4](https://github.com/TriPSs/nestjs-query/commit/6ada4f4a12633d41c60de9540dfc28ed0985ca62))
* **filters:** Fix bug with incorect parameters in filters ([9f4e93b](https://github.com/TriPSs/nestjs-query/commit/9f4e93b7726d85cb4febe86d2caf941dc957463a))
* **query-typeorm:** Fixed `deleteMany` throwing error when called with filter that contained relations ([53c6c6b](https://github.com/TriPSs/nestjs-query/commit/53c6c6b9f0533f311d0de56d78a1a95a61713438))
* **query-typeorm:** Fixed `deleteMany` throwing error when called with filter that contained relations ([6f8ac0b](https://github.com/TriPSs/nestjs-query/commit/6f8ac0b7960447e903c40635990addb66b46348c))
* **query-typeorm:** Fixed `getManyToManyOwnerMeta` ([887df20](https://github.com/TriPSs/nestjs-query/commit/887df206eca99a80e5f8b37b5f00711d1ee3ecec))
* **query-typeorm:** Fixed `updateMany` not supporting relations ([93ef5a9](https://github.com/TriPSs/nestjs-query/commit/93ef5a9002b1c2206a39770d6f8f59c5bfe26ecc))
* **query-typeorm:** Fixed group by for aggregated date fields ([7ffeaf6](https://github.com/TriPSs/nestjs-query/commit/7ffeaf6b9e400eb027298a3870712eb7124c88bb))
* **query-typeorm:** import jest-extended into typeorm query service ([f539b29](https://github.com/TriPSs/nestjs-query/commit/f539b29fad60c070e8736f872d547fd498eb3c4f))
* **query-typeorm:** Use `qb` directly when adding additional fields ([5843ac4](https://github.com/TriPSs/nestjs-query/commit/5843ac4a7f0542efa9d33d1798e7ac3c2eaf16ca))
* **tests:** fix jest-extended typings and eslint problems ([6af8af1](https://github.com/TriPSs/nestjs-query/commit/6af8af13a33faaa1585561e7b426b125a6368b6b))
* **typeorm, #954:** Filtering on relations with pagination  ([#977](https://github.com/TriPSs/nestjs-query/issues/977)) ([f5a6374](https://github.com/TriPSs/nestjs-query/commit/f5a6374f6e22470f63ef6257f7271c818ed09321)), closes [#954](https://github.com/TriPSs/nestjs-query/issues/954) [#954](https://github.com/TriPSs/nestjs-query/issues/954) [#954](https://github.com/TriPSs/nestjs-query/issues/954) [#954](https://github.com/TriPSs/nestjs-query/issues/954)
* **typeorm,#493:** Fix uni-directional relation SQL ([7887b8c](https://github.com/TriPSs/nestjs-query/commit/7887b8c94516194840df03139fecd0d5a0f38f65))
* **typeorm,#895:** Wrap all OR and AND expressions in brackets ([838ab16](https://github.com/TriPSs/nestjs-query/commit/838ab16befe7a53f5fb11e84624c3b30811f61c6)), closes [#895](https://github.com/TriPSs/nestjs-query/issues/895)
* **typeorm:** Allow using string based typeorm relations ([55c157d](https://github.com/TriPSs/nestjs-query/commit/55c157dbea9ce8c1186a2c2ea17f847857fd2226))
* **typeorm:** Ensure record is entity instance when saving ([3cdbbaf](https://github.com/TriPSs/nestjs-query/commit/3cdbbaff11b18bcc5e6fd29fd182e2bd66b14f17)), closes [#380](https://github.com/TriPSs/nestjs-query/issues/380)
* **typeorm:** Fix import path in relation service [#363](https://github.com/TriPSs/nestjs-query/issues/363) ([0e6d484](https://github.com/TriPSs/nestjs-query/commit/0e6d484920960ed1966360a89af979230667b5f7))
* **typeorm:** fix unit tests after fix filters bug ([5f50419](https://github.com/TriPSs/nestjs-query/commit/5f5041906694ae7c4aa799f52049d0981b97ccfc))
* **typeorm:** revert uneeded change to test entity ([86f7fd9](https://github.com/TriPSs/nestjs-query/commit/86f7fd9abb101eb40af2cf66009d50cb8c173eea))
* **type:** Pin dev dependencies ([442db4c](https://github.com/TriPSs/nestjs-query/commit/442db4cd9b9d48d0c6a20209f0b44c4a314660ac))


### chore

* Update third batch of deps + linting rules ([acaff0f](https://github.com/TriPSs/nestjs-query/commit/acaff0fd56918a26cc108d6d98ef71b275400da4))


### Code Refactoring

* Move project to NX ([c70a022](https://github.com/TriPSs/nestjs-query/commit/c70a022671b84025bb10ba3db0a3e5a11ddcccd7))


### Features

* Added support for `withDeleted` in `Relation` decorator ([923d972](https://github.com/TriPSs/nestjs-query/commit/923d972660d06cc76065d90b4a46f8775669ff0b))
* **aggregations,typeorm:** Add relation aggregation to typeorm ([2bf35a9](https://github.com/TriPSs/nestjs-query/commit/2bf35a92ce80b1f3026fd87cb62cad17eb6eff03))
* **aggregations:** Add aggregations to graphql ([af075d2](https://github.com/TriPSs/nestjs-query/commit/af075d2e93b6abbbfbe32afcc917350f803fadaa))
* **aggretations:** Add aggregations support to typeorm ([7233c23](https://github.com/TriPSs/nestjs-query/commit/7233c2397d0ac332e5209ab87ae62f5f555609d6))
* allow for passing `useSoftDelete` in resolver opts ([4c59cd8](https://github.com/TriPSs/nestjs-query/commit/4c59cd82f87663a40634523101c7f511afe77e63))
* **graphql,connection:** Add totalCount to connections ([ed1e84a](https://github.com/TriPSs/nestjs-query/commit/ed1e84a2feb6f89c3b270fcbc1d0eaf6aec5e575))
* **graphql:** Add graphql module ([282c421](https://github.com/TriPSs/nestjs-query/commit/282c421d0e6f67fe750fa6005f6cb7d960c8fbd0))
* **graphql:** Allow specifying allowed comparisons on filterable fields ([ced2792](https://github.com/TriPSs/nestjs-query/commit/ced27920e5c2278c2a04c027a692e25b3306f6cb))
* **query-typeorm:** allow deeply nested filters ([0bd6b76](https://github.com/TriPSs/nestjs-query/commit/0bd6b76c4dbd876df7f9a991803843405d24fdb9))
* **typegoose:** Add typegoose package ([#846](https://github.com/TriPSs/nestjs-query/issues/846)) ([73cf5cd](https://github.com/TriPSs/nestjs-query/commit/73cf5cdbf11496ad3a3ce3f6bb69975510de26e2))
* **typeorm:** Add additional filter options to QueryService ([64241dc](https://github.com/TriPSs/nestjs-query/commit/64241dc9c4565c3bb2d4f168c837578bd706c48c))
* **typeorm:** Add support for filtering on relations ([aa8788c](https://github.com/TriPSs/nestjs-query/commit/aa8788cbbc0c95465e1633b57ca48c91b160038a))
* **typeorm:** Add support for soft deletes ([2ab42fa](https://github.com/TriPSs/nestjs-query/commit/2ab42faee2802abae4d8496e2529b8eb23860ed4))
* **typeorm:** Implement `setRelations` to set many relations ([d1109b7](https://github.com/TriPSs/nestjs-query/commit/d1109b70f961cf59d7cbc8b8a85c401980a2b6c4))
* **typeorm:** Switch to use unioned queries for relations ([327c676](https://github.com/TriPSs/nestjs-query/commit/327c6760e3e1a7db6bb0f872928d0502345c925f))
* **typeorm:** Update to support new aggregate with groupBy ([e2a4f30](https://github.com/TriPSs/nestjs-query/commit/e2a4f3066834ae7fddf0239ab647a0a9de667149))


### Performance Improvements

* **query-typeorm:** Rewrote `batchQueryRelations` to use one query ([c7aa255](https://github.com/TriPSs/nestjs-query/commit/c7aa255e11e86bf13e87e7d3cd26ef34d556bb1a))
* **query-typeorm:** Use existing join alias if there is one ([419d5b4](https://github.com/TriPSs/nestjs-query/commit/419d5b4f23efa111f698620e118b7168a1a594bd))


### BREAKING CHANGES

* Nothing special, just want the major version bump as we updated a lot of deps
* Project is moved to NX, deps may still be incorrect



# 1.0.0-alpha.0 (2022-08-26)


### Bug Fixes

* Add consistent sorting for aggregate queries ([4ac7a14](https://github.com/TriPSs/nestjs-query/commit/4ac7a1485c7dcd83569951298606f487608806b1))
* **deps:** pin dependencies ([93e9f66](https://github.com/TriPSs/nestjs-query/commit/93e9f664d21e05ed1adc35f1bfafcb6acfe8e536))
* **deps:** update dependency uuid to v8.3.1 ([a2b7555](https://github.com/TriPSs/nestjs-query/commit/a2b7555c1186e48999d44aa8af9b792f32b18b7e))
* **deps:** update dependency uuid to v8.3.2 ([289f1ed](https://github.com/TriPSs/nestjs-query/commit/289f1ed5610781792d3c1efa5492376095084ac0))
* **eslint:** Fix eslint to recognize sub packages ([13fdd2b](https://github.com/TriPSs/nestjs-query/commit/13fdd2b31289dbc80316cbdb5aa32edbe596bad4))
* **filters:** Fix bug with incorect parameters in filter ([6ada4f4](https://github.com/TriPSs/nestjs-query/commit/6ada4f4a12633d41c60de9540dfc28ed0985ca62))
* **filters:** Fix bug with incorect parameters in filters ([9f4e93b](https://github.com/TriPSs/nestjs-query/commit/9f4e93b7726d85cb4febe86d2caf941dc957463a))
* **query-typeorm:** Fixed `deleteMany` throwing error when called with filter that contained relations ([53c6c6b](https://github.com/TriPSs/nestjs-query/commit/53c6c6b9f0533f311d0de56d78a1a95a61713438))
* **query-typeorm:** Fixed `deleteMany` throwing error when called with filter that contained relations ([6f8ac0b](https://github.com/TriPSs/nestjs-query/commit/6f8ac0b7960447e903c40635990addb66b46348c))
* **query-typeorm:** Fixed `getManyToManyOwnerMeta` ([887df20](https://github.com/TriPSs/nestjs-query/commit/887df206eca99a80e5f8b37b5f00711d1ee3ecec))
* **query-typeorm:** Fixed `updateMany` not supporting relations ([93ef5a9](https://github.com/TriPSs/nestjs-query/commit/93ef5a9002b1c2206a39770d6f8f59c5bfe26ecc))
* **query-typeorm:** Fixed group by for aggregated date fields ([7ffeaf6](https://github.com/TriPSs/nestjs-query/commit/7ffeaf6b9e400eb027298a3870712eb7124c88bb))
* **query-typeorm:** import jest-extended into typeorm query service ([f539b29](https://github.com/TriPSs/nestjs-query/commit/f539b29fad60c070e8736f872d547fd498eb3c4f))
* **query-typeorm:** Use `qb` directly when adding additional fields ([5843ac4](https://github.com/TriPSs/nestjs-query/commit/5843ac4a7f0542efa9d33d1798e7ac3c2eaf16ca))
* **tests:** fix jest-extended typings and eslint problems ([6af8af1](https://github.com/TriPSs/nestjs-query/commit/6af8af13a33faaa1585561e7b426b125a6368b6b))
* **typeorm, #954:** Filtering on relations with pagination  ([#977](https://github.com/TriPSs/nestjs-query/issues/977)) ([f5a6374](https://github.com/TriPSs/nestjs-query/commit/f5a6374f6e22470f63ef6257f7271c818ed09321)), closes [#954](https://github.com/TriPSs/nestjs-query/issues/954) [#954](https://github.com/TriPSs/nestjs-query/issues/954) [#954](https://github.com/TriPSs/nestjs-query/issues/954) [#954](https://github.com/TriPSs/nestjs-query/issues/954)
* **typeorm,#493:** Fix uni-directional relation SQL ([7887b8c](https://github.com/TriPSs/nestjs-query/commit/7887b8c94516194840df03139fecd0d5a0f38f65))
* **typeorm,#895:** Wrap all OR and AND expressions in brackets ([838ab16](https://github.com/TriPSs/nestjs-query/commit/838ab16befe7a53f5fb11e84624c3b30811f61c6)), closes [#895](https://github.com/TriPSs/nestjs-query/issues/895)
* **typeorm:** Allow using string based typeorm relations ([55c157d](https://github.com/TriPSs/nestjs-query/commit/55c157dbea9ce8c1186a2c2ea17f847857fd2226))
* **typeorm:** Ensure record is entity instance when saving ([3cdbbaf](https://github.com/TriPSs/nestjs-query/commit/3cdbbaff11b18bcc5e6fd29fd182e2bd66b14f17)), closes [#380](https://github.com/TriPSs/nestjs-query/issues/380)
* **typeorm:** Fix import path in relation service [#363](https://github.com/TriPSs/nestjs-query/issues/363) ([0e6d484](https://github.com/TriPSs/nestjs-query/commit/0e6d484920960ed1966360a89af979230667b5f7))
* **typeorm:** fix unit tests after fix filters bug ([5f50419](https://github.com/TriPSs/nestjs-query/commit/5f5041906694ae7c4aa799f52049d0981b97ccfc))
* **typeorm:** revert uneeded change to test entity ([86f7fd9](https://github.com/TriPSs/nestjs-query/commit/86f7fd9abb101eb40af2cf66009d50cb8c173eea))
* **type:** Pin dev dependencies ([442db4c](https://github.com/TriPSs/nestjs-query/commit/442db4cd9b9d48d0c6a20209f0b44c4a314660ac))


### chore

* Update third batch of deps + linting rules ([acaff0f](https://github.com/TriPSs/nestjs-query/commit/acaff0fd56918a26cc108d6d98ef71b275400da4))


### Code Refactoring

* Move project to NX ([c70a022](https://github.com/TriPSs/nestjs-query/commit/c70a022671b84025bb10ba3db0a3e5a11ddcccd7))


### Features

* Added support for `withDeleted` in `Relation` decorator ([923d972](https://github.com/TriPSs/nestjs-query/commit/923d972660d06cc76065d90b4a46f8775669ff0b))
* **aggregations,typeorm:** Add relation aggregation to typeorm ([2bf35a9](https://github.com/TriPSs/nestjs-query/commit/2bf35a92ce80b1f3026fd87cb62cad17eb6eff03))
* **aggregations:** Add aggregations to graphql ([af075d2](https://github.com/TriPSs/nestjs-query/commit/af075d2e93b6abbbfbe32afcc917350f803fadaa))
* **aggretations:** Add aggregations support to typeorm ([7233c23](https://github.com/TriPSs/nestjs-query/commit/7233c2397d0ac332e5209ab87ae62f5f555609d6))
* allow for passing `useSoftDelete` in resolver opts ([4c59cd8](https://github.com/TriPSs/nestjs-query/commit/4c59cd82f87663a40634523101c7f511afe77e63))
* **graphql,connection:** Add totalCount to connections ([ed1e84a](https://github.com/TriPSs/nestjs-query/commit/ed1e84a2feb6f89c3b270fcbc1d0eaf6aec5e575))
* **graphql:** Add graphql module ([282c421](https://github.com/TriPSs/nestjs-query/commit/282c421d0e6f67fe750fa6005f6cb7d960c8fbd0))
* **graphql:** Allow specifying allowed comparisons on filterable fields ([ced2792](https://github.com/TriPSs/nestjs-query/commit/ced27920e5c2278c2a04c027a692e25b3306f6cb))
* **query-typeorm:** allow deeply nested filters ([0bd6b76](https://github.com/TriPSs/nestjs-query/commit/0bd6b76c4dbd876df7f9a991803843405d24fdb9))
* **typegoose:** Add typegoose package ([#846](https://github.com/TriPSs/nestjs-query/issues/846)) ([73cf5cd](https://github.com/TriPSs/nestjs-query/commit/73cf5cdbf11496ad3a3ce3f6bb69975510de26e2))
* **typeorm:** Add additional filter options to QueryService ([64241dc](https://github.com/TriPSs/nestjs-query/commit/64241dc9c4565c3bb2d4f168c837578bd706c48c))
* **typeorm:** Add support for filtering on relations ([aa8788c](https://github.com/TriPSs/nestjs-query/commit/aa8788cbbc0c95465e1633b57ca48c91b160038a))
* **typeorm:** Add support for soft deletes ([2ab42fa](https://github.com/TriPSs/nestjs-query/commit/2ab42faee2802abae4d8496e2529b8eb23860ed4))
* **typeorm:** Implement `setRelations` to set many relations ([d1109b7](https://github.com/TriPSs/nestjs-query/commit/d1109b70f961cf59d7cbc8b8a85c401980a2b6c4))
* **typeorm:** Switch to use unioned queries for relations ([327c676](https://github.com/TriPSs/nestjs-query/commit/327c6760e3e1a7db6bb0f872928d0502345c925f))
* **typeorm:** Update to support new aggregate with groupBy ([e2a4f30](https://github.com/TriPSs/nestjs-query/commit/e2a4f3066834ae7fddf0239ab647a0a9de667149))


### Performance Improvements

* **query-typeorm:** Rewrote `batchQueryRelations` to use one query ([c7aa255](https://github.com/TriPSs/nestjs-query/commit/c7aa255e11e86bf13e87e7d3cd26ef34d556bb1a))
* **query-typeorm:** Use existing join alias if there is one ([419d5b4](https://github.com/TriPSs/nestjs-query/commit/419d5b4f23efa111f698620e118b7168a1a594bd))


### BREAKING CHANGES

* Nothing special, just want the major version bump as we updated a lot of deps
* Project is moved to NX, deps may still be incorrect



# 1.0.0-alpha.0 (2022-08-26)


### Bug Fixes

* Add consistent sorting for aggregate queries ([4ac7a14](https://github.com/TriPSs/nestjs-query/commit/4ac7a1485c7dcd83569951298606f487608806b1))
* **deps:** pin dependencies ([93e9f66](https://github.com/TriPSs/nestjs-query/commit/93e9f664d21e05ed1adc35f1bfafcb6acfe8e536))
* **deps:** update dependency uuid to v8.3.1 ([a2b7555](https://github.com/TriPSs/nestjs-query/commit/a2b7555c1186e48999d44aa8af9b792f32b18b7e))
* **deps:** update dependency uuid to v8.3.2 ([289f1ed](https://github.com/TriPSs/nestjs-query/commit/289f1ed5610781792d3c1efa5492376095084ac0))
* **eslint:** Fix eslint to recognize sub packages ([13fdd2b](https://github.com/TriPSs/nestjs-query/commit/13fdd2b31289dbc80316cbdb5aa32edbe596bad4))
* **filters:** Fix bug with incorect parameters in filter ([6ada4f4](https://github.com/TriPSs/nestjs-query/commit/6ada4f4a12633d41c60de9540dfc28ed0985ca62))
* **filters:** Fix bug with incorect parameters in filters ([9f4e93b](https://github.com/TriPSs/nestjs-query/commit/9f4e93b7726d85cb4febe86d2caf941dc957463a))
* **query-typeorm:** Fixed `deleteMany` throwing error when called with filter that contained relations ([53c6c6b](https://github.com/TriPSs/nestjs-query/commit/53c6c6b9f0533f311d0de56d78a1a95a61713438))
* **query-typeorm:** Fixed `deleteMany` throwing error when called with filter that contained relations ([6f8ac0b](https://github.com/TriPSs/nestjs-query/commit/6f8ac0b7960447e903c40635990addb66b46348c))
* **query-typeorm:** Fixed `getManyToManyOwnerMeta` ([887df20](https://github.com/TriPSs/nestjs-query/commit/887df206eca99a80e5f8b37b5f00711d1ee3ecec))
* **query-typeorm:** Fixed `updateMany` not supporting relations ([93ef5a9](https://github.com/TriPSs/nestjs-query/commit/93ef5a9002b1c2206a39770d6f8f59c5bfe26ecc))
* **query-typeorm:** Fixed group by for aggregated date fields ([7ffeaf6](https://github.com/TriPSs/nestjs-query/commit/7ffeaf6b9e400eb027298a3870712eb7124c88bb))
* **query-typeorm:** import jest-extended into typeorm query service ([f539b29](https://github.com/TriPSs/nestjs-query/commit/f539b29fad60c070e8736f872d547fd498eb3c4f))
* **query-typeorm:** Use `qb` directly when adding additional fields ([5843ac4](https://github.com/TriPSs/nestjs-query/commit/5843ac4a7f0542efa9d33d1798e7ac3c2eaf16ca))
* **tests:** fix jest-extended typings and eslint problems ([6af8af1](https://github.com/TriPSs/nestjs-query/commit/6af8af13a33faaa1585561e7b426b125a6368b6b))
* **typeorm, #954:** Filtering on relations with pagination  ([#977](https://github.com/TriPSs/nestjs-query/issues/977)) ([f5a6374](https://github.com/TriPSs/nestjs-query/commit/f5a6374f6e22470f63ef6257f7271c818ed09321)), closes [#954](https://github.com/TriPSs/nestjs-query/issues/954) [#954](https://github.com/TriPSs/nestjs-query/issues/954) [#954](https://github.com/TriPSs/nestjs-query/issues/954) [#954](https://github.com/TriPSs/nestjs-query/issues/954)
* **typeorm,#493:** Fix uni-directional relation SQL ([7887b8c](https://github.com/TriPSs/nestjs-query/commit/7887b8c94516194840df03139fecd0d5a0f38f65))
* **typeorm,#895:** Wrap all OR and AND expressions in brackets ([838ab16](https://github.com/TriPSs/nestjs-query/commit/838ab16befe7a53f5fb11e84624c3b30811f61c6)), closes [#895](https://github.com/TriPSs/nestjs-query/issues/895)
* **typeorm:** Allow using string based typeorm relations ([55c157d](https://github.com/TriPSs/nestjs-query/commit/55c157dbea9ce8c1186a2c2ea17f847857fd2226))
* **typeorm:** Ensure record is entity instance when saving ([3cdbbaf](https://github.com/TriPSs/nestjs-query/commit/3cdbbaff11b18bcc5e6fd29fd182e2bd66b14f17)), closes [#380](https://github.com/TriPSs/nestjs-query/issues/380)
* **typeorm:** Fix import path in relation service [#363](https://github.com/TriPSs/nestjs-query/issues/363) ([0e6d484](https://github.com/TriPSs/nestjs-query/commit/0e6d484920960ed1966360a89af979230667b5f7))
* **typeorm:** fix unit tests after fix filters bug ([5f50419](https://github.com/TriPSs/nestjs-query/commit/5f5041906694ae7c4aa799f52049d0981b97ccfc))
* **typeorm:** revert uneeded change to test entity ([86f7fd9](https://github.com/TriPSs/nestjs-query/commit/86f7fd9abb101eb40af2cf66009d50cb8c173eea))
* **type:** Pin dev dependencies ([442db4c](https://github.com/TriPSs/nestjs-query/commit/442db4cd9b9d48d0c6a20209f0b44c4a314660ac))


### chore

* Update third batch of deps + linting rules ([acaff0f](https://github.com/TriPSs/nestjs-query/commit/acaff0fd56918a26cc108d6d98ef71b275400da4))


### Code Refactoring

* Move project to NX ([c70a022](https://github.com/TriPSs/nestjs-query/commit/c70a022671b84025bb10ba3db0a3e5a11ddcccd7))


### Features

* Added support for `withDeleted` in `Relation` decorator ([923d972](https://github.com/TriPSs/nestjs-query/commit/923d972660d06cc76065d90b4a46f8775669ff0b))
* **aggregations,typeorm:** Add relation aggregation to typeorm ([2bf35a9](https://github.com/TriPSs/nestjs-query/commit/2bf35a92ce80b1f3026fd87cb62cad17eb6eff03))
* **aggregations:** Add aggregations to graphql ([af075d2](https://github.com/TriPSs/nestjs-query/commit/af075d2e93b6abbbfbe32afcc917350f803fadaa))
* **aggretations:** Add aggregations support to typeorm ([7233c23](https://github.com/TriPSs/nestjs-query/commit/7233c2397d0ac332e5209ab87ae62f5f555609d6))
* allow for passing `useSoftDelete` in resolver opts ([4c59cd8](https://github.com/TriPSs/nestjs-query/commit/4c59cd82f87663a40634523101c7f511afe77e63))
* **graphql,connection:** Add totalCount to connections ([ed1e84a](https://github.com/TriPSs/nestjs-query/commit/ed1e84a2feb6f89c3b270fcbc1d0eaf6aec5e575))
* **graphql:** Add graphql module ([282c421](https://github.com/TriPSs/nestjs-query/commit/282c421d0e6f67fe750fa6005f6cb7d960c8fbd0))
* **graphql:** Allow specifying allowed comparisons on filterable fields ([ced2792](https://github.com/TriPSs/nestjs-query/commit/ced27920e5c2278c2a04c027a692e25b3306f6cb))
* **query-typeorm:** allow deeply nested filters ([0bd6b76](https://github.com/TriPSs/nestjs-query/commit/0bd6b76c4dbd876df7f9a991803843405d24fdb9))
* **typegoose:** Add typegoose package ([#846](https://github.com/TriPSs/nestjs-query/issues/846)) ([73cf5cd](https://github.com/TriPSs/nestjs-query/commit/73cf5cdbf11496ad3a3ce3f6bb69975510de26e2))
* **typeorm:** Add additional filter options to QueryService ([64241dc](https://github.com/TriPSs/nestjs-query/commit/64241dc9c4565c3bb2d4f168c837578bd706c48c))
* **typeorm:** Add support for filtering on relations ([aa8788c](https://github.com/TriPSs/nestjs-query/commit/aa8788cbbc0c95465e1633b57ca48c91b160038a))
* **typeorm:** Add support for soft deletes ([2ab42fa](https://github.com/TriPSs/nestjs-query/commit/2ab42faee2802abae4d8496e2529b8eb23860ed4))
* **typeorm:** Implement `setRelations` to set many relations ([d1109b7](https://github.com/TriPSs/nestjs-query/commit/d1109b70f961cf59d7cbc8b8a85c401980a2b6c4))
* **typeorm:** Switch to use unioned queries for relations ([327c676](https://github.com/TriPSs/nestjs-query/commit/327c6760e3e1a7db6bb0f872928d0502345c925f))
* **typeorm:** Update to support new aggregate with groupBy ([e2a4f30](https://github.com/TriPSs/nestjs-query/commit/e2a4f3066834ae7fddf0239ab647a0a9de667149))


### Performance Improvements

* **query-typeorm:** Rewrote `batchQueryRelations` to use one query ([c7aa255](https://github.com/TriPSs/nestjs-query/commit/c7aa255e11e86bf13e87e7d3cd26ef34d556bb1a))
* **query-typeorm:** Use existing join alias if there is one ([419d5b4](https://github.com/TriPSs/nestjs-query/commit/419d5b4f23efa111f698620e118b7168a1a594bd))


### BREAKING CHANGES

* Nothing special, just want the major version bump as we updated a lot of deps
* Project is moved to NX, deps may still be incorrect



# 1.0.0-alpha.0 (2022-08-26)


### Bug Fixes

* Add consistent sorting for aggregate queries ([4ac7a14](https://github.com/TriPSs/nestjs-query/commit/4ac7a1485c7dcd83569951298606f487608806b1))
* **deps:** pin dependencies ([93e9f66](https://github.com/TriPSs/nestjs-query/commit/93e9f664d21e05ed1adc35f1bfafcb6acfe8e536))
* **deps:** update dependency uuid to v8.3.1 ([a2b7555](https://github.com/TriPSs/nestjs-query/commit/a2b7555c1186e48999d44aa8af9b792f32b18b7e))
* **deps:** update dependency uuid to v8.3.2 ([289f1ed](https://github.com/TriPSs/nestjs-query/commit/289f1ed5610781792d3c1efa5492376095084ac0))
* **eslint:** Fix eslint to recognize sub packages ([13fdd2b](https://github.com/TriPSs/nestjs-query/commit/13fdd2b31289dbc80316cbdb5aa32edbe596bad4))
* **filters:** Fix bug with incorect parameters in filter ([6ada4f4](https://github.com/TriPSs/nestjs-query/commit/6ada4f4a12633d41c60de9540dfc28ed0985ca62))
* **filters:** Fix bug with incorect parameters in filters ([9f4e93b](https://github.com/TriPSs/nestjs-query/commit/9f4e93b7726d85cb4febe86d2caf941dc957463a))
* **query-typeorm:** Fixed `deleteMany` throwing error when called with filter that contained relations ([53c6c6b](https://github.com/TriPSs/nestjs-query/commit/53c6c6b9f0533f311d0de56d78a1a95a61713438))
* **query-typeorm:** Fixed `deleteMany` throwing error when called with filter that contained relations ([6f8ac0b](https://github.com/TriPSs/nestjs-query/commit/6f8ac0b7960447e903c40635990addb66b46348c))
* **query-typeorm:** Fixed `getManyToManyOwnerMeta` ([887df20](https://github.com/TriPSs/nestjs-query/commit/887df206eca99a80e5f8b37b5f00711d1ee3ecec))
* **query-typeorm:** Fixed `updateMany` not supporting relations ([93ef5a9](https://github.com/TriPSs/nestjs-query/commit/93ef5a9002b1c2206a39770d6f8f59c5bfe26ecc))
* **query-typeorm:** Fixed group by for aggregated date fields ([7ffeaf6](https://github.com/TriPSs/nestjs-query/commit/7ffeaf6b9e400eb027298a3870712eb7124c88bb))
* **query-typeorm:** import jest-extended into typeorm query service ([f539b29](https://github.com/TriPSs/nestjs-query/commit/f539b29fad60c070e8736f872d547fd498eb3c4f))
* **query-typeorm:** Use `qb` directly when adding additional fields ([5843ac4](https://github.com/TriPSs/nestjs-query/commit/5843ac4a7f0542efa9d33d1798e7ac3c2eaf16ca))
* **tests:** fix jest-extended typings and eslint problems ([6af8af1](https://github.com/TriPSs/nestjs-query/commit/6af8af13a33faaa1585561e7b426b125a6368b6b))
* **typeorm, #954:** Filtering on relations with pagination  ([#977](https://github.com/TriPSs/nestjs-query/issues/977)) ([f5a6374](https://github.com/TriPSs/nestjs-query/commit/f5a6374f6e22470f63ef6257f7271c818ed09321)), closes [#954](https://github.com/TriPSs/nestjs-query/issues/954) [#954](https://github.com/TriPSs/nestjs-query/issues/954) [#954](https://github.com/TriPSs/nestjs-query/issues/954) [#954](https://github.com/TriPSs/nestjs-query/issues/954)
* **typeorm,#493:** Fix uni-directional relation SQL ([7887b8c](https://github.com/TriPSs/nestjs-query/commit/7887b8c94516194840df03139fecd0d5a0f38f65))
* **typeorm,#895:** Wrap all OR and AND expressions in brackets ([838ab16](https://github.com/TriPSs/nestjs-query/commit/838ab16befe7a53f5fb11e84624c3b30811f61c6)), closes [#895](https://github.com/TriPSs/nestjs-query/issues/895)
* **typeorm:** Allow using string based typeorm relations ([55c157d](https://github.com/TriPSs/nestjs-query/commit/55c157dbea9ce8c1186a2c2ea17f847857fd2226))
* **typeorm:** Ensure record is entity instance when saving ([3cdbbaf](https://github.com/TriPSs/nestjs-query/commit/3cdbbaff11b18bcc5e6fd29fd182e2bd66b14f17)), closes [#380](https://github.com/TriPSs/nestjs-query/issues/380)
* **typeorm:** Fix import path in relation service [#363](https://github.com/TriPSs/nestjs-query/issues/363) ([0e6d484](https://github.com/TriPSs/nestjs-query/commit/0e6d484920960ed1966360a89af979230667b5f7))
* **typeorm:** fix unit tests after fix filters bug ([5f50419](https://github.com/TriPSs/nestjs-query/commit/5f5041906694ae7c4aa799f52049d0981b97ccfc))
* **typeorm:** revert uneeded change to test entity ([86f7fd9](https://github.com/TriPSs/nestjs-query/commit/86f7fd9abb101eb40af2cf66009d50cb8c173eea))
* **type:** Pin dev dependencies ([442db4c](https://github.com/TriPSs/nestjs-query/commit/442db4cd9b9d48d0c6a20209f0b44c4a314660ac))


### chore

* Update third batch of deps + linting rules ([acaff0f](https://github.com/TriPSs/nestjs-query/commit/acaff0fd56918a26cc108d6d98ef71b275400da4))


### Code Refactoring

* Move project to NX ([c70a022](https://github.com/TriPSs/nestjs-query/commit/c70a022671b84025bb10ba3db0a3e5a11ddcccd7))


### Features

* Added support for `withDeleted` in `Relation` decorator ([923d972](https://github.com/TriPSs/nestjs-query/commit/923d972660d06cc76065d90b4a46f8775669ff0b))
* **aggregations,typeorm:** Add relation aggregation to typeorm ([2bf35a9](https://github.com/TriPSs/nestjs-query/commit/2bf35a92ce80b1f3026fd87cb62cad17eb6eff03))
* **aggregations:** Add aggregations to graphql ([af075d2](https://github.com/TriPSs/nestjs-query/commit/af075d2e93b6abbbfbe32afcc917350f803fadaa))
* **aggretations:** Add aggregations support to typeorm ([7233c23](https://github.com/TriPSs/nestjs-query/commit/7233c2397d0ac332e5209ab87ae62f5f555609d6))
* allow for passing `useSoftDelete` in resolver opts ([4c59cd8](https://github.com/TriPSs/nestjs-query/commit/4c59cd82f87663a40634523101c7f511afe77e63))
* **graphql,connection:** Add totalCount to connections ([ed1e84a](https://github.com/TriPSs/nestjs-query/commit/ed1e84a2feb6f89c3b270fcbc1d0eaf6aec5e575))
* **graphql:** Add graphql module ([282c421](https://github.com/TriPSs/nestjs-query/commit/282c421d0e6f67fe750fa6005f6cb7d960c8fbd0))
* **graphql:** Allow specifying allowed comparisons on filterable fields ([ced2792](https://github.com/TriPSs/nestjs-query/commit/ced27920e5c2278c2a04c027a692e25b3306f6cb))
* **query-typeorm:** allow deeply nested filters ([0bd6b76](https://github.com/TriPSs/nestjs-query/commit/0bd6b76c4dbd876df7f9a991803843405d24fdb9))
* **typegoose:** Add typegoose package ([#846](https://github.com/TriPSs/nestjs-query/issues/846)) ([73cf5cd](https://github.com/TriPSs/nestjs-query/commit/73cf5cdbf11496ad3a3ce3f6bb69975510de26e2))
* **typeorm:** Add additional filter options to QueryService ([64241dc](https://github.com/TriPSs/nestjs-query/commit/64241dc9c4565c3bb2d4f168c837578bd706c48c))
* **typeorm:** Add support for filtering on relations ([aa8788c](https://github.com/TriPSs/nestjs-query/commit/aa8788cbbc0c95465e1633b57ca48c91b160038a))
* **typeorm:** Add support for soft deletes ([2ab42fa](https://github.com/TriPSs/nestjs-query/commit/2ab42faee2802abae4d8496e2529b8eb23860ed4))
* **typeorm:** Implement `setRelations` to set many relations ([d1109b7](https://github.com/TriPSs/nestjs-query/commit/d1109b70f961cf59d7cbc8b8a85c401980a2b6c4))
* **typeorm:** Switch to use unioned queries for relations ([327c676](https://github.com/TriPSs/nestjs-query/commit/327c6760e3e1a7db6bb0f872928d0502345c925f))
* **typeorm:** Update to support new aggregate with groupBy ([e2a4f30](https://github.com/TriPSs/nestjs-query/commit/e2a4f3066834ae7fddf0239ab647a0a9de667149))


### Performance Improvements

* **query-typeorm:** Rewrote `batchQueryRelations` to use one query ([c7aa255](https://github.com/TriPSs/nestjs-query/commit/c7aa255e11e86bf13e87e7d3cd26ef34d556bb1a))
* **query-typeorm:** Use existing join alias if there is one ([419d5b4](https://github.com/TriPSs/nestjs-query/commit/419d5b4f23efa111f698620e118b7168a1a594bd))


### BREAKING CHANGES

* Nothing special, just want the major version bump as we updated a lot of deps
* Project is moved to NX, deps may still be incorrect
