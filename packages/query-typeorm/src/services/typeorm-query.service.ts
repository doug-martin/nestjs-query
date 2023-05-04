import {
  Query,
  DeleteManyResponse,
  UpdateManyResponse,
  DeepPartial,
  Class,
  QueryService,
  Filter,
  AggregateQuery,
  AggregateResponse,
  FindByIdOptions,
  GetByIdOptions,
  UpdateOneOptions,
  DeleteOneOptions,
  Filterable,
} from '@codeshine/nestjs-query-core';
import { Repository, DeleteResult, ObjectLiteral } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { DeepPartial as TypeOrmDeepPartial } from 'typeorm/common/DeepPartial';
import { MethodNotAllowedException, NotFoundException } from '@nestjs/common';
import { FilterQueryBuilder, AggregateBuilder } from '../query';
import { RelationQueryService } from './relation-query.service';

export interface TypeOrmQueryServiceOpts<Entity extends ObjectLiteral> {
  useSoftDelete?: boolean;
  filterQueryBuilder?: FilterQueryBuilder<Entity>;
}

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
export class TypeOrmQueryService<Entity extends ObjectLiteral>
  extends RelationQueryService<Entity>
  implements QueryService<Entity, DeepPartial<Entity>, DeepPartial<Entity>>
{
  readonly filterQueryBuilder: FilterQueryBuilder<Entity>;

  readonly useSoftDelete: boolean;

  constructor(readonly repo: Repository<Entity>, opts?: TypeOrmQueryServiceOpts<Entity>) {
    super();
    this.filterQueryBuilder = opts?.filterQueryBuilder ?? new FilterQueryBuilder<Entity>(this.repo);
    this.useSoftDelete = opts?.useSoftDelete ?? false;
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  get EntityClass(): Class<Entity> {
    return this.repo.target as Class<Entity>;
  }

  /**
   * Query for multiple entities, using a Query from `@codeshine/nestjs-query-core`.
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

  async aggregate(filter: Filter<Entity>, aggregate: AggregateQuery<Entity>): Promise<AggregateResponse<Entity>[]> {
    return AggregateBuilder.asyncConvertToAggregateResponse(
      this.filterQueryBuilder.aggregate({ filter }, aggregate).getRawMany<Record<string, unknown>>(),
    );
  }

  async count(filter: Filter<Entity>): Promise<number> {
    return this.filterQueryBuilder.select({ filter }).getCount();
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
  async findById(id: string | number, opts?: FindByIdOptions<Entity>): Promise<Entity | undefined> {
    return (await this.filterQueryBuilder.selectById(id, opts ?? {}).getOne()) ?? undefined;
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
  async getById(id: string | number, opts?: GetByIdOptions<Entity>): Promise<Entity> {
    const entity = await this.findById(id, opts);
    if (!entity) {
      throw new NotFoundException(`Unable to find ${this.EntityClass.name} with id: ${id}`);
    }
    return entity;
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
  async createOne(record: DeepPartial<Entity>): Promise<Entity> {
    const entity = await this.ensureIsEntityAndDoesNotExist(record);
    return this.repo.save(entity);
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
  async createMany(records: DeepPartial<Entity>[]): Promise<Entity[]> {
    const entities = await Promise.all(records.map((r) => this.ensureIsEntityAndDoesNotExist(r)));
    return this.repo.save(entities);
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
   * @param opts - Additional options.
   */
  async updateOne(id: number | string, update: DeepPartial<Entity>, opts?: UpdateOneOptions<Entity>): Promise<Entity> {
    this.ensureIdIsNotPresent(update);
    const entity = await this.getById(id, opts);
    return this.repo.save(this.repo.merge(entity, update as TypeOrmDeepPartial<Entity>));
  }

  /**
   * Update multiple entities with a `@codeshine/nestjs-query-core` Filter.
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
  async updateMany(update: DeepPartial<Entity>, filter: Filter<Entity>): Promise<UpdateManyResponse> {
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
   * @param filter Additional filter to use when finding the entity to delete.
   */
  async deleteOne(id: string | number, opts?: DeleteOneOptions<Entity>): Promise<Entity> {
    const entity = await this.getById(id, opts);
    if (this.useSoftDelete) {
      return this.repo.softRemove(entity);
    }
    return this.repo.remove(entity);
  }

  /**
   * Delete multiple records with a `@codeshine/nestjs-query-core` `Filter`.
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
    let deleteResult: DeleteResult;
    if (this.useSoftDelete) {
      deleteResult = await this.filterQueryBuilder.softDelete({ filter }).execute();
    } else {
      deleteResult = await this.filterQueryBuilder.delete({ filter }).execute();
    }
    return { deletedCount: deleteResult.affected || 0 };
  }

  /**
   * Restore an entity by `id`.
   *
   * @example
   *
   * ```ts
   * const restoredTodo = await this.service.restoreOne(1);
   * ```
   *
   * @param id - The `id` of the entity to restore.
   * @param opts Additional filter to use when finding the entity to restore.
   */
  async restoreOne(id: string | number, opts?: Filterable<Entity>): Promise<Entity> {
    this.ensureSoftDeleteEnabled();
    await this.repo.restore(id);
    return this.getById(id, opts);
  }

  /**
   * Restores multiple records with a `@codeshine/nestjs-query-core` `Filter`.
   *
   * @example
   *
   * ```ts
   * const { updatedCount } = this.service.restoreMany({
   *   created: { lte: new Date('2020-1-1') }
   * });
   * ```
   *
   * @param filter - A `Filter` to find records to delete.
   */
  async restoreMany(filter: Filter<Entity>): Promise<UpdateManyResponse> {
    this.ensureSoftDeleteEnabled();
    const result = await this.filterQueryBuilder.softDelete({ filter }).restore().execute();
    return { updatedCount: result.affected || 0 };
  }

  private async ensureIsEntityAndDoesNotExist(e: DeepPartial<Entity>): Promise<Entity> {
    if (!(e instanceof this.EntityClass)) {
      return this.ensureEntityDoesNotExist(this.repo.create(e as TypeOrmDeepPartial<Entity>));
    }
    return this.ensureEntityDoesNotExist(e);
  }

  private async ensureEntityDoesNotExist(e: Entity): Promise<Entity> {
    if (this.repo.hasId(e)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const found = await this.repo.findOneById(this.repo.getId(e) as string | number);
      if (found) {
        throw new Error('Entity already exists');
      }
    }
    return e;
  }

  private ensureIdIsNotPresent(e: DeepPartial<Entity>): void {
    if (this.repo.hasId(e as unknown as Entity)) {
      throw new Error('Id cannot be specified when updating');
    }
  }

  private ensureSoftDeleteEnabled(): void {
    if (!this.useSoftDelete) {
      throw new MethodNotAllowedException(`Restore not allowed for non soft deleted entity ${this.EntityClass.name}.`);
    }
  }
}
