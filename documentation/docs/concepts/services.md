---
title: Services
---

The `core` package defines a `QueryService` which is used to query and modify records.

The following methods are defined on the `QueryService`

* `query(query: Query<DTO>): Promise<DTO[]>`
  * find multiple records.
* `findById(id: string | number): Promise<DTO | undefined>`
  * find a record by its id.
* `getById(id: string | number): Promise<DTO>`
  * get a record by its id or return a rejected promise with a NotFound error.
* `createMany<C extends DeepPartial<DTO>>(items: C[]): Promise<DTO[]>`
  * create multiple records.
* `createOne<C extends DeepPartial<DTO>>(item: C): Promise<DTO>`
  * create one record.
* `updateMany<U extends DeepPartial<DTO>>(update: U, filter: Filter<DTO>): Promise<UpdateManyResponse>`
  * update many records.
* `updateOne<U extends DeepPartial<DTO>>(id: string | number, update: U): Promise<DTO>`
  * update a single record.
* `deleteMany(filter: Filter<DTO>): Promise<DeleteManyResponse>`
  * delete multiple records.
* `deleteOne(id: number | string): Promise<DTO>`
  * delete a single record.

All `QueryServices` should be decorated with the `@QueryService` decorator.

You can create your own service for use with the `CRUDResolver` as long as it implements the `QueryService` interface.

The `@nestjs-query/query-typeorm` and `@nestjs-query/query-sequelize` packages define an implementation to use. [Read More](../persistence/services.mdx)
