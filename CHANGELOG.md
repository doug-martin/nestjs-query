# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
