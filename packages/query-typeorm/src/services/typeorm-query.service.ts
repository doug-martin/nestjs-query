import {
  Query,
  DeleteManyResponse,
  UpdateManyResponse,
  DeepPartial,
  Class,
  QueryService,
  Filter,
} from '@nestjs-query/core';
import { Repository, DeepPartial as TypeOrmDeepPartial, RelationQueryBuilder } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { FilterQueryBuilder } from '../query';

/**
 * Base class for all query services that use a `typeorm` Repository.
 *
 * @example
 *
 * ```ts
 * @Injectable()
 * export class TodoItemService extends TypeOrmQueryService<TodoItemEntity> {
 *   constructor(
 *      @InjectRepository(TodoItemEntity) repo: Repository<TodoItemEntity>,
 *   ) {
 *     super(repo);
 *   }
 * }
 * ```
 */
export class TypeOrmQueryService<Entity> implements QueryService<Entity> {
  /**
   * Creates a new QueryService for the passed in repository.
   * @param repo - the `typeorm` Repository.
   * @param filterQueryBuilder - **Should not need to provide through user code**. But allows you to specify the
   * FilterQueryBuilder, can be useful for testing.
   */
  constructor(protected repo: Repository<Entity>, readonly filterQueryBuilder = new FilterQueryBuilder(repo)) {}

  private get entityType(): Class<Entity> {
    return this.repo.target as Class<Entity>;
  }

  /**
   * Query for multiple entities, using a Query from `@nestjs-query/core`.
   *
   * @example
   * ```ts
   * const todoItems = await this.service.query({
   *   filter: { title: { eq: 'Foo' } },
   *   paging: { limit: 10 },
   *   sorting: [{ field: "create", direction: SortDirection.DESC }],
   * });
   * ```
   * @param query - The Query used to filter, page, and sort rows.
   */
  query(query: Query<Entity>): Promise<Entity[]> {
    return this.filterQueryBuilder.select(query).getMany();
  }

  /**
   * Query for an array of relations.
   * @param entity - The entity to query relations for.
   * @param relationName - The name of relation to query for.
   * @param query - A query to filter, page or sort relations.
   */
  queryRelations<Relation>(entity: Entity, relationName: string, query: Query<Relation>): Promise<Relation[]> {
    return this.filterQueryBuilder.selectRelation(this.ensureIsEntity(entity), relationName, query).getMany();
  }

  /**
   * Finds a single relation.
   * @param entity - The entity to find the relation on.
   * @param relationName - The name of the relation to query for.
   */
  findRelation<Relation>(entity: Entity, relationName: string): Promise<Relation | undefined> {
    return this.createRelationQueryBuilder(this.ensureIsEntity(entity), relationName).loadOne<Relation>();
  }

  /**
   * Add a single relation.
   * @param id - The id of the entity to add the relation to.
   * @param relationName - The name of the relation to query for.
   * @param relationIds - The ids of relations to add.
   */
  async addRelations<Relation>(
    id: string | number,
    relationName: string,
    relationIds: (string | number)[],
  ): Promise<Entity> {
    const entity = await this.getById(id);
    await this.createRelationQueryBuilder(entity, relationName).add(relationIds);
    return entity;
  }

  /**
   * Set the relation on the entity.
   *
   * @param id - The id of the entity to set the relation on.
   * @param relationName - The name of the relation to query for.
   * @param relationId - The id of the relation to set on the entity.
   */
  async setRelation<Relation>(id: string | number, relationName: string, relationId: string | number): Promise<Entity> {
    const entity = await this.getById(id);
    await this.createRelationQueryBuilder(entity, relationName).set(relationId);
    return entity;
  }

  /**
   * Find an entity by it's `id`.
   *
   * @example
   * ```ts
   * const todoItem = await this.service.findById(1);
   * ```
   * @param id - The id of the record to find.
   */
  findById(id: string | number): Promise<Entity | undefined> {
    return this.repo.findOne(id);
  }

  /**
   * Removes multiple relations.
   * @param id - The id of the entity to add the relation to.
   * @param relationName - The name of the relation to query for.
   * @param relationIds - The ids of the relations to add.
   */
  async removeRelations<Relation>(
    id: string | number,
    relationName: string,
    relationIds: (string | number)[],
  ): Promise<Entity> {
    const entity = await this.getById(id);
    await this.createRelationQueryBuilder(entity, relationName).remove(relationIds);
    return entity;
  }

  /**
   * Remove the relation on the entity.
   *
   * @param id - The id of the entity to set the relation on.
   * @param relationName - The name of the relation to query for.
   * @param relationId - The id of the relation to set on the entity.
   */
  async removeRelation<Relation>(
    id: string | number,
    relationName: string,
    relationId: string | number,
  ): Promise<Entity> {
    const entity = await this.getById(id);
    await this.createRelationQueryBuilder(entity, relationName).remove(relationId);
    return entity;
  }

  /**
   * Gets an entity by it's `id`. If the entity is not found a rejected promise is returned.
   *
   * @example
   * ```ts
   * try {
   *   const todoItem = await this.service.getById(1);
   * } catch(e) {
   *   console.error('Unable to find entity with id = 1');
   * }
   * ```
   * @param id - The id of the record to find.
   */
  getById(id: string | number): Promise<Entity> {
    return this.repo.findOneOrFail(id);
  }

  /**
   * Creates a single entity.
   *
   * @example
   * ```ts
   * const todoItem = await this.service.createOne({title: 'Todo Item', completed: false });
   * ```
   * @param record - The entity to create.
   */
  createOne<C extends DeepPartial<Entity>>(record: C): Promise<Entity> {
    return this.repo.save(this.ensureIsEntity(record));
  }

  /**
   * Create multiple entities.
   *
   * @example
   * ```ts
   * const todoItem = await this.service.createMany([
   *   {title: 'Todo Item 1', completed: false },
   *   {title: 'Todo Item 2', completed: true },
   * ]);
   * ```
   * @param records - The entities to create.
   */
  createMany<C extends DeepPartial<Entity>>(records: C[]): Promise<Entity[]> {
    return this.repo.save(records.map(item => this.ensureIsEntity(item)));
  }

  /**
   * Update an entity.
   *
   * @example
   * ```ts
   * const updatedEntity = await this.service.updateOne(1, { completed: true });
   * ```
   * @param id - The `id` of the record.
   * @param update - A `Partial` of the entity with fields to update.
   */
  async updateOne<U extends DeepPartial<Entity>>(id: number | string, update: U): Promise<Entity> {
    const entity = await this.getById(id);
    return this.repo.save(this.repo.merge(entity, update as TypeOrmDeepPartial<Entity>));
  }

  /**
   * Update multiple entities with a `@nestjs-query/core` Filter.
   *
   * @example
   * ```ts
   * const { updatedCount } = await this.service.updateMany(
   *   { completed: true }, // the update to apply
   *   { title: { eq: 'Foo Title' } } // Filter to find records to update
   * );
   * ```
   * @param update - A `Partial` of entity with the fields to update
   * @param filter - A Filter used to find the records to update
   */
  async updateMany<U extends DeepPartial<Entity>>(update: U, filter: Filter<Entity>): Promise<UpdateManyResponse> {
    const updateResult = await this.filterQueryBuilder
      .update({ filter })
      .set({ ...(update as QueryDeepPartialEntity<Entity>) })
      .execute();
    return { updatedCount: updateResult.affected || 0 };
  }

  /**
   * Delete an entity by `id`.
   *
   * @example
   *
   * ```ts
   * const deletedTodo = await this.service.deleteOne(1);
   * ```
   *
   * @param id - The `id` of the entity to delete.
   */
  async deleteOne(id: string | number): Promise<Entity> {
    const entity = await this.getById(id);
    return this.repo.remove(entity);
  }

  /**
   * Delete multiple records with a `@nestjs-query/core` `Filter`.
   *
   * @example
   *
   * ```ts
   * const { deletedCount } = this.service.deleteMany({
   *   created: { lte: new Date('2020-1-1') }
   * });
   * ```
   *
   * @param filter - A `Filter` to find records to delete.
   */
  async deleteMany(filter: Filter<Entity>): Promise<DeleteManyResponse> {
    const deleteResult = await this.filterQueryBuilder.delete({ filter }).execute();
    return { deletedCount: deleteResult.affected || 0 };
  }

  /**
   * Covert an object to the `Entity` type if it is not an instance already.
   *
   * @param obj - The object to covert to an `Entity`
   */
  private ensureIsEntity(obj: DeepPartial<Entity>): Entity {
    if (obj instanceof this.entityType) {
      return obj as Entity;
    }
    return plainToClass(this.entityType, obj);
  }

  private createRelationQueryBuilder(entity: Entity, relationName: string): RelationQueryBuilder<Entity> {
    return this.repo
      .createQueryBuilder()
      .relation(relationName)
      .of(entity);
  }
}
