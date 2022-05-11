/* eslint-disable no-underscore-dangle */
import {
  AggregateQuery,
  AggregateResponse,
  DeepPartial,
  DeleteManyResponse,
  DeleteOneOptions,
  Filter,
  FindByIdOptions,
  GetByIdOptions,
  Query,
  QueryService,
  UpdateManyResponse,
  UpdateOneOptions
} from '@ptc-org/nestjs-query-core';
import { NotFoundException } from '@nestjs/common';
import { Document, Model as MongooseModel, PipelineStage, UpdateQuery } from 'mongoose';
import { AggregateBuilder, FilterQueryBuilder } from '../query';
import { ReferenceQueryService } from './reference-query.service';

type MongoDBUpdatedOutput = {
  nModified: number;
};

type MongoDBDeletedOutput = {
  deletedCount: number;
};

/**
 * Base class for all query services that use Typegoose.
 *
 * @example
 *
 * ```ts
 * @QueryService(TodoItemEntity)
 * export class TodoItemService extends TypegooseQueryService<TodoItemEntity> {
 *   constructor(
 *     @InjectModel(TodoItemEntity) model: ReturnModelType<typeof TodoItemEntity>,
 *   ) {
 *     super(model);
 *   }
 * }
 * ```
 */
export class MongooseQueryService<Entity extends Document>
  extends ReferenceQueryService<Entity>
  implements QueryService<Entity, DeepPartial<Entity>, DeepPartial<Entity>> {
  constructor(
    readonly Model: MongooseModel<Entity>,
    readonly filterQueryBuilder: FilterQueryBuilder<Entity> = new FilterQueryBuilder(Model)
  ) {
    super();
  }

  /**
   * Query for multiple entities, using a Query from `@ptc-org/nestjs-query-core`.
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
    const { filterQuery, options } = this.filterQueryBuilder.buildQuery(query);
    return this.Model.find(filterQuery, {}, options).exec();
  }

  async aggregate(
    filter: Filter<Entity>,
    aggregateQuery: AggregateQuery<Entity>
  ): Promise<AggregateResponse<Entity>[]> {
    const { aggregate, filterQuery, options } = this.filterQueryBuilder.buildAggregateQuery(aggregateQuery, filter);
    const aggPipeline: PipelineStage[] = [{ $match: filterQuery }, { $group: aggregate }];
    if (options.sort) {
      aggPipeline.push({ $sort: options.sort ?? {} });
    }
    const aggResult = (await this.Model.aggregate<Record<string, unknown>>(aggPipeline).exec()) as Record<string, unknown>[];
    return AggregateBuilder.convertToAggregateResponse(aggResult);
  }

  count(filter: Filter<Entity>): Promise<number> {
    const filterQuery = this.filterQueryBuilder.buildFilterQuery(filter);
    return this.Model.count(filterQuery).exec();
  }

  /**
   * Find an entity by it's `id`.
   *
   * @example
   * ```ts
   * const todoItem = await this.service.findById(1);
   * ```
   * @param id - The id of the record to find.
   * @param opts - Additional options
   */
  async findById(id: string | number, opts?: FindByIdOptions<Entity>): Promise<Entity | undefined> {
    const filterQuery = this.filterQueryBuilder.buildIdFilterQuery(id, opts?.filter);
    const doc = await this.Model.findOne(filterQuery);
    if (!doc) {
      return undefined;
    }
    return doc;
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
   * @param opts - Additional options
   */
  async getById(id: string, opts?: GetByIdOptions<Entity>): Promise<Entity> {
    const doc = await this.findById(id, opts);
    if (!doc) {
      throw new NotFoundException(`Unable to find ${this.Model.modelName} with id: ${id}`);
    }
    return doc;
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
    this.ensureIdIsNotPresent(record);
    return this.Model.create(record);
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
    records.forEach((r) => this.ensureIdIsNotPresent(r));
    return this.Model.create(records);
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
   * @param opts - Additional options
   */
  async updateOne(id: string, update: DeepPartial<Entity>, opts?: UpdateOneOptions<Entity>): Promise<Entity> {
    this.ensureIdIsNotPresent(update);
    const filterQuery = this.filterQueryBuilder.buildIdFilterQuery(id, opts?.filter);

    const doc = await this.Model.findOneAndUpdate(filterQuery, this.getUpdateQuery(update), {
      new: true
    });

    if (!doc) {
      throw new NotFoundException(`Unable to find ${this.Model.modelName} with id: ${id}`);
    }
    return doc;
  }

  /**
   * Update multiple entities with a `@ptc-org/nestjs-query-core` Filter.
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
    const filterQuery = this.filterQueryBuilder.buildFilterQuery(filter);
    const res = (await this.Model.updateMany(filterQuery, this.getUpdateQuery(update)).exec());
    return { updatedCount: res.modifiedCount || 0 };
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
   * @param opts - Additional filter to use when finding the entity to delete.
   */
  async deleteOne(id: string, opts?: DeleteOneOptions<Entity>): Promise<Entity> {
    const filterQuery = this.filterQueryBuilder.buildIdFilterQuery(id, opts?.filter);
    const doc = await this.Model.findOneAndDelete(filterQuery);
    if (!doc) {
      throw new NotFoundException(`Unable to find ${this.Model.modelName} with id: ${id}`);
    }
    return doc;
  }

  /**
   * Delete multiple records with a `@ptc-org/nestjs-query-core` `Filter`.
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
    const filterQuery = this.filterQueryBuilder.buildFilterQuery(filter);
    const res = (await this.Model.deleteMany(filterQuery).exec()) as MongoDBDeletedOutput;
    return { deletedCount: res.deletedCount || 0 };
  }

  private ensureIdIsNotPresent(e: DeepPartial<Entity>): void {
    if (Object.keys(e).find((f) => f === 'id' || f === '_id')) {
      throw new Error('Id cannot be specified when updating or creating');
    }
  }

  private getUpdateQuery(entity: DeepPartial<Entity>): UpdateQuery<Entity> {
    if (entity instanceof this.Model) {
      return entity.modifiedPaths().reduce(
        (update: UpdateQuery<Entity>, k) =>
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          ({ ...update, [k]: entity.get(k) }),
        {}
      );
    }
    return entity as UpdateQuery<Entity>;
  }
}
