---
title: Services
---

The `core` package defines a `QueryService` interface that has the following methods.

* `query` - find multiple records.
* `findById` - find a record by its id.
* `getById` - get a record by its id or return a rejected promise with a NotFound error.
* `createMany` - create multiple records.
* `createOne` - create one record.
* `updateMany` - update many records.
* `updateOne` - update a single record.
* `deleteMany` - delete multiple records.
* `deleteOne` - delete a single record.

You can create your own service for use with the `CRUDResolver` as long as it implements the `QueryService` interface.

The `@nestjs-query/query-typeorm` package defines a base class `TypeOrmQueryService` that uses a `typeorm` repository
to create and execute queries. [Read about the TypeOrmQueryService](../typeorm/services)


