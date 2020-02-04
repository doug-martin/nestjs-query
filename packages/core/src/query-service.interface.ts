import { DeepPartial } from './common';
import { DeleteManyResponse, Query, UpdateManyResponse, Filter } from './interfaces';

/**
 * Base interface for all QueryServices.
 *
 * @typeparam T - The record type that the query service will operate on.
 */
export interface QueryService<T> {
  /**
   * Query for multiple records of type `T`.
   * @param query - the query used to filer, page or sort records.
   * @returns a promise with an array of records that match the query.
   */
  query(query: Query<T>): Promise<T[]>;

  /**
   * Finds a record by `id`.
   * @param id - the id of the record to find.
   * @returns the found record or undefined.
   */
  findById(id: string | number): Promise<T | undefined>;

  /**
   * Query for an array of relations.
   * @param entity - The entity to query relations for.
   * @param relationName - The name of relation to query for.
   * @param query - A query to filter, page or sort relations.
   */
  queryRelations<Relation>(entity: T, relationName: string, query: Query<Relation>): Promise<Relation[]>;

  /**
   * Finds a single relation.
   * @param entity - The entity to find the relation on.
   * @param relationName - The name of the relation to query for.
   */
  findRelation<Relation>(entity: T, relationName: string): Promise<Relation | undefined>;

  /**
   * Adds multiple relations.
   * @param id - The id of the entity to add the relation to.
   * @param relationName - The name of the relation to query for.
   * @param relationIds - The ids of the relations to add.
   */
  addRelations<Relation>(id: string | number, relationName: string, relationIds: (string | number)[]): Promise<T>;

  /**
   * Set the relation on the entity.
   *
   * @param id - The id of the entity to set the relation on.
   * @param relationName - The name of the relation to query for.
   * @param relationId - The id of the relation to set on the entity.
   */
  setRelation<Relation>(id: string | number, relationName: string, relationId: string | number): Promise<T>;

  /**
   * Removes multiple relations.
   * @param id - The id of the entity to add the relation to.
   * @param relationName - The name of the relation to query for.
   * @param relationIds - The ids of the relations to add.
   */
  removeRelations<Relation>(id: string | number, relationName: string, relationIds: (string | number)[]): Promise<T>;

  /**
   * Remove the relation on the entity.
   *
   * @param id - The id of the entity to set the relation on.
   * @param relationName - The name of the relation to query for.
   * @param relationId - The id of the relation to set on the entity.
   */
  removeRelation<Relation>(id: string | number, relationName: string, relationId: string | number): Promise<T>;

  /**
   * Gets a record by `id`.
   *
   * **NOTE** This method will return a rejected Promise if the record is not found.
   *
   * @param id - the id of the record.
   * @returns the found record or a rejected promise.
   */
  getById(id: string | number): Promise<T>;

  /**
   * Create a single record.
   *
   * @param item - the record to create.
   * @returns the created record.
   */
  createOne<C extends DeepPartial<T>>(item: C): Promise<T>;

  /**
   * Creates a multiple record.
   *
   * @param items - the records to create.
   * @returns a created records.
   */
  createMany<C extends DeepPartial<T>>(items: C[]): Promise<T[]>;

  /**
   * Update one record.
   * @param id - the id of the record to update
   * @param update - The update to apply.
   * @returns the updated record.
   */
  updateOne<U extends DeepPartial<T>>(id: string | number, update: U): Promise<T>;

  /**
   * Updates multiple records using a filter.
   * @param update - the update to apply.
   * @param filter - the filter used to specify records to update
   */
  updateMany<U extends DeepPartial<T>>(update: U, filter: Filter<T>): Promise<UpdateManyResponse>;

  /**
   * Delete a single record by id.
   * @param id - the id of the record to delete.
   */
  deleteOne(id: number | string): Promise<T>;

  /**
   * Delete multiple records using a filter.
   *
   * @param filter - the filter to find records to delete.
   */
  deleteMany(filter: Filter<T>): Promise<DeleteManyResponse>;
}
