import { Injectable } from '@nestjs/common';
import { DeepPartial, Class } from '../common';
import { DeleteManyResponse, Filter, Query, UpdateManyResponse } from '../interfaces';

/**
 * Base interface for all QueryServices.
 *
 * @typeparam T - The record type that the query service will operate on.
 */
export interface QueryService<DTO> {
  /**
   * Query for multiple records of type `T`.
   * @param query - the query used to filer, page or sort records.
   * @returns a promise with an array of records that match the query.
   */
  query(query: Query<DTO>): Promise<DTO[]>;

  /**
   * Finds a record by `id`.
   * @param id - the id of the record to find.
   * @returns the found record or undefined.
   */
  findById(id: string | number): Promise<DTO | undefined>;

  /**
   * Query for an array of relations.
   * * @param RelationClass - The class to serialize the Relations into
   * @param entity - The entity to query relations for.
   * @param relationName - The name of relation to query for.
   * @param query - A query to filter, page or sort relations.
   */
  queryRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    entity: DTO,
    query: Query<Relation>,
  ): Promise<Relation[]>;

  queryRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dtos: DTO[],
    query: Query<Relation>,
  ): Promise<Map<DTO, Relation[]>>;

  /**
   * Finds a single relation.
   * @param RelationClass - The class to serialize the Relation into
   * @param entity - The entity to find the relation on.
   * @param relationName - The name of the relation to query for.
   */
  findRelation<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    entity: DTO,
  ): Promise<Relation | undefined>;

  /**
   * Finds a single relation for each DTO passed in.
   *
   * @param RelationClass - The class to serialize the Relation into
   * @param entity - The entity to find the relation on.
   * @param relationName - The name of the relation to query for.
   */
  findRelation<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dtos: DTO[],
  ): Promise<Map<DTO, Relation | undefined>>;

  /**
   * Adds multiple relations.
   * @param relationName - The name of the relation to query for.
   * @param id - The id of the entity to add the relation to.
   * @param relationIds - The ids of the relations to add.
   */
  addRelations<Relation>(relationName: string, id: string | number, relationIds: (string | number)[]): Promise<DTO>;

  /**
   * Set the relation on the entity.
   *
   * @param relationName - The name of the relation to query for.
   * @param id - The id of the entity to set the relation on.
   * @param relationId - The id of the relation to set on the entity.
   */
  setRelation<Relation>(relationName: string, id: string | number, relationId: string | number): Promise<DTO>;

  /**
   * Removes multiple relations.
   * @param relationName - The name of the relation to query for.
   * @param id - The id of the entity to add the relation to.
   * @param relationIds - The ids of the relations to add.
   */
  removeRelations<Relation>(relationName: string, id: string | number, relationIds: (string | number)[]): Promise<DTO>;

  /**
   * Remove the relation on the entity.
   *
   * @param relationName - The name of the relation to query for.
   * @param id - The id of the entity to set the relation on.
   * @param relationId - The id of the relation to set on the entity.
   */
  removeRelation<Relation>(relationName: string, id: string | number, relationId: string | number): Promise<DTO>;

  /**
   * Gets a record by `id`.
   *
   * **NOTE** This method will return a rejected Promise if the record is not found.
   *
   * @param id - the id of the record.
   * @returns the found record or a rejected promise.
   */
  getById(id: string | number): Promise<DTO>;

  /**
   * Create a single record.
   *
   * @param item - the record to create.
   * @returns the created record.
   */
  createOne<C extends DeepPartial<DTO>>(item: C): Promise<DTO>;

  /**
   * Creates a multiple record.
   *
   * @param items - the records to create.
   * @returns a created records.
   */
  createMany<C extends DeepPartial<DTO>>(items: C[]): Promise<DTO[]>;

  /**
   * Update one record.
   * @param id - the id of the record to update
   * @param update - The update to apply.
   * @returns the updated record.
   */
  updateOne<U extends DeepPartial<DTO>>(id: string | number, update: U): Promise<DTO>;

  /**
   * Updates multiple records using a filter.
   * @param update - the update to apply.
   * @param filter - the filter used to specify records to update
   */
  updateMany<U extends DeepPartial<DTO>>(update: U, filter: Filter<DTO>): Promise<UpdateManyResponse>;

  /**
   * Delete a single record by id.
   * @param id - the id of the record to delete.
   */
  deleteOne(id: number | string): Promise<DTO>;

  /**
   * Delete multiple records using a filter.
   *
   * @param filter - the filter to find records to delete.
   */
  deleteMany(filter: Filter<DTO>): Promise<DeleteManyResponse>;
}

/**
 * QueryService decorator to register with nestjs-query
 * @param DTOClass - the DTO class that the QueryService is used for.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function QueryService<DTO>(DTOClass: Class<DTO>) {
  return <Cls extends Class<QueryService<DTO>>>(cls: Cls): Cls | void => {
    return Injectable()(cls);
  };
}

export function getQueryServiceToken<DTO>(DTOClass: Class<DTO>): string {
  return `${DTOClass.name}QueryService`;
}
