import {
  Query,
  DeleteManyResponse,
  UpdateManyResponse,
  DeepPartial,
  Class,
  QueryService,
  Filter,
} from '@nestjs-query/core';
import { Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { FilterQueryBuilder } from '../query';
import { RelationQueryService } from './relation-query.service';

/**
 * Base class for all query services that use a `typeorm` Repository.
 *
 * @example
 *
 * ```ts
 * @QueryService(TodoItemEntity)
 * export class TodoItemService extends TypeOrmQueryService<TodoItemEntity> {
 *   constructor(
 *      @InjectRepository(TodoItemEntity) repo: Repository<TodoItemEntity>,
 *   ) {
 *     super(repo);
 *   }
 * }
 * ```
 */
export class TypeOrmQueryService<Entity> extends RelationQueryService<Entity> implements QueryService<Entity> {
  readonly filterQueryBuilder: FilterQueryBuilder<Entity>;

  constructor(readonly repo: Repository<Entity>, filterQueryBuilder?: FilterQueryBuilder<Entity>) {
    super();
    this.filterQueryBuilder = filterQueryBuilder ?? new FilterQueryBuilder<Entity>(this.repo);
  }

  get EntityClass(): Class<Entity> {
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
  async query(query: Query<Entity>): Promise<Entity[]> {
    return this.filterQueryBuilder.select(query).getMany();
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
  async findById(id: string | number): Promise<Entity | undefined> {
    return this.repo.findOne(id);
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
  async getById(id: string | number): Promise<Entity> {
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
  async createOne<C extends DeepPartial<Entity>>(record: C): Promise<Entity> {
    this.ensureIdIsNotPresent(record);
    return this.repo.save(record);
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
  async createMany<C extends DeepPartial<Entity>>(records: C[]): Promise<Entity[]> {
    records.forEach((r) => this.ensureIdIsNotPresent(r));
    return this.repo.save(records);
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
    this.ensureIdIsNotPresent(update);
    const entity = await this.repo.findOneOrFail(id);
    return this.repo.save(this.repo.merge(entity, update));
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
    this.ensureIdIsNotPresent(update);
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
    const entity = await this.repo.findOneOrFail(id);
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

  ensureIdIsNotPresent(e: DeepPartial<Entity>): void {
    if (this.repo.hasId((e as unknown) as Entity)) {
      throw new Error('Id cannot be specified when creating or updating');
    }
  }
}
