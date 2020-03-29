# v0.7.3

* [DOCS] Update docs to include a complete example of custom methods [#64](https://github.com/doug-martin/nestjs-query/issues/64)
* [FIXED] Issue where creating or updating allows specifying primary keys [#65](https://github.com/doug-martin/nestjs-query/issues/65)

# v0.7.2

* [CHORE] Updated to `@nestjs/graphql` `v7.1.3`
* Removed `PartialType` and `PartialInputType` in favor of `@nestjs/graphql` implementation.

# v0.7.1

* [FIXED] Issue where update input DTO was not automatically created

# v0.7.0

* Updated to `@nestjs/graphql` `v7.x`.
    * This was a passive change for the library usage however you should still follow the migration guide [found here](https://docs.nestjs.com/migration-guide)

# v0.6.0

* [FIXED] Get Underlying Entity Object [#41](https://github.com/doug-martin/nestjs-query/issues)
    * Changed `TypeOrmQueryService` to operate on the `Entity`
    * Added new `AssemblerQueryService` to translate between the `DTO` and `Entity`
* [ADDED] New `InjectTypeOrmQueryService` decorator to auto-create a TypeOrm query service. 

# v0.5.1

* [DOCS] Added clarification around individual resolvers and relations with examples [#42](https://github.com/doug-martin/nestjs-query/issues/42)
* [ADDED] Exposed `Relatable` mixin from `@nestjs-query/graphql` [#42](https://github.com/doug-martin/nestjs-query/issues/42)

# v0.5.0

* Added `decorators` option to resolver options to allow providing custom decorators to endpoints [#36](https://github.com/doug-martin/nestjs-query/issues/36)

# v0.4.0

* Updated all mutations to take a single `input` argument with custom fields.
    *   `createOne(input: DTO)` -> `createOne(input: { [dtoName]: DTO })`
    *   `createMany(input: DTO[])` -> `createOne(input: { [pluralDTOName]: DTO[] })`
    *   `updateOne(id: ID, input: UpdateDTO)` -> `createOne(input: { id: ID, update: UpdateDTO })`
    *   `updateMany(filter: Filter<DTO>, input: UpdateDTO)` -> `createOne(input: { filter: Filter<DTO>, update: UpdateDTO })`
    *   `deleteOne(input: ID)` -> `deleteOne(input: {id: ID})`
    *   `deleteMany(input: Filter<DTO>)` -> `createOne(input: { filter: Filter<DTO> })`
* Updated docs to reflect changes.

# v0.3.5

* [FIXED] Validate Input for Create & Update [#19](https://github.com/doug-martin/nestjs-query/issues/19)

# v0.3.4

* [FIXED] Can't remove on Many-To-Many relations [#31](https://github.com/doug-martin/nestjs-query/issues/31)

# v0.3.3

* Update typescript to 3.8.
* Update dependency versions. 

# v0.3.2

* Switched to github actions 

# v0.3.1

* Hardened TypeORM querying
    * Added filter for entity ids on relations to prevent querying for too many rows.
    * Qualify all filter and sorting columns, to prevent column name collisions. 

# v0.3.0

* Added dataloader support!
* Fixed issue with loading of many-to-many relations [#22](https://github.com/doug-martin/nestjs-query/issues/22)

# v0.2.1

* Fixed case where `@FilterableField` decorator was not passing arguments correctly to `@Field` decorator [#20](https://github.com/doug-martin/nestjs-query/issues/20)

# v0.2.0

* Add `Assemblers` to convert DTOs and Entities that are a different shape. See https://doug-martin.github.io/nestjs-query/docs/concepts/assemblers

# v0.1.0

* Add `relations` to resolvers. See https://doug-martin.github.io/nestjs-query/docs/graphql/relations

# v0.0.6

* Dont allow empty filters with `updateMany` or `deleteMany` operations.

# v0.0.5

* Add ability to specify query defaults.
   * `defaultResultSize` -  the default number of results to return from a query
   * `maxResultsSize` -  the maximum number of results to return from a query
   * `defaultSort` -  The default sort to apply to queries
   * `defaultFilter` -  The default filter to apply to queries

# v0.0.4

* Add files field to `@nestjs-query/core` `package.json`

# v0.0.3

* Fix package READMEs
* Add security scanning on sub modules.

# v0.0.2

* Add MIT license

# v0.0.1

* Initial Release
