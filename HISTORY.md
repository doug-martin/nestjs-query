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
