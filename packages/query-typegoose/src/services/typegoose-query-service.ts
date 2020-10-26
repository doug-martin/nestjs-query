import {
  Query,
  Filter,
  AggregateQuery,
  AggregateResponse,
  FindByIdOptions,
  GetByIdOptions,
  DeepPartial,
  DeleteManyResponse,
  DeleteOneOptions,
  UpdateManyResponse,
  UpdateOneOptions,
} from '@nestjs-query/core';
import { CreateQuery, DocumentToObjectOptions, UpdateQuery } from 'mongoose';
import { AggregateBuilder, FilterQueryBuilder } from '../query';
import { ReturnModelType, DocumentType } from '@typegoose/typegoose';
import { NotFoundException } from '@nestjs/common';
import { ReferenceQueryService } from './reference-query.service';

type MongoDBUpdatedOutput = {
  nModified: number;
};

export interface TypegooseQueryServiceOpts {
  documentToObjectOptions?: DocumentToObjectOptions;
}

export class TypegooseQueryService<Entity> extends ReferenceQueryService<Entity> {
  protected readonly documentToObjectOptions: DocumentToObjectOptions;
  readonly filterQueryBuilder: FilterQueryBuilder<Entity> = new FilterQueryBuilder();

  constructor(readonly Model: ReturnModelType<new () => Entity>, opts?: TypegooseQueryServiceOpts) {
    super();
    this.documentToObjectOptions = opts?.documentToObjectOptions || { virtuals: true };
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
    const { filterQuery, options } = this.filterQueryBuilder.buildQuery(query);
    const entities = await this.Model.find(filterQuery, {}, options).exec();
    return entities.map((doc) => doc.toObject(this.documentToObjectOptions) as Entity);
  }

  async aggregate(filter: Filter<Entity>, aggregateQuery: AggregateQuery<Entity>): Promise<AggregateResponse<Entity>> {
    const { aggregate, filterQuery } = this.filterQueryBuilder.buildAggregateQuery(aggregateQuery, filter);
    const aggResult = (await this.Model.aggregate<Record<string, unknown>>([
      { $match: filterQuery },
      { $group: { _id: null, ...aggregate } },
    ]).exec()) as Record<string, unknown>[];
    return AggregateBuilder.convertToAggregateResponse(aggResult[0]);
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
    return doc.toObject(this.documentToObjectOptions) as Entity;
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
    return await this.Model.create(record as CreateQuery<Entity>);
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
    const entities = await this.Model.create(records as CreateQuery<Entity>[]);
    return entities.map((entity) => entity.toObject(this.documentToObjectOptions) as Entity);
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
    const doc = await this.Model.findOneAndUpdate(filterQuery, this.getUpdateQuery(update as DocumentType<Entity>), {
      new: true,
    });
    if (!doc) {
      throw new NotFoundException(`Unable to find ${this.Model.modelName} with id: ${id}`);
    }
    return doc;
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
  async updateMany(update: DeepPartial<Entity>, filter: Filter<Entity>): Promise<UpdateManyResponse> {
    this.ensureIdIsNotPresent(update);
    const filterQuery = this.filterQueryBuilder.buildFilterQuery(filter);
    const res = (await this.Model.updateMany(
      filterQuery,
      this.getUpdateQuery(update as DocumentType<Entity>),
    ).exec()) as MongoDBUpdatedOutput;
    return { updatedCount: res.nModified || 0 };
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
    return doc.toObject(this.documentToObjectOptions) as Entity;
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
    const filterQuery = this.filterQueryBuilder.buildFilterQuery(filter);
    const res = await this.Model.deleteMany(filterQuery).exec();
    return { deletedCount: res.deletedCount || 0 };
  }

  private ensureIdIsNotPresent(e: DeepPartial<Entity>): void {
    if (Object.keys(e).find((f) => f === 'id' || f === '_id')) {
      throw new Error('Id cannot be specified when updating or creating');
    }
  }

  private getUpdateQuery(entity: DocumentType<Entity>): UpdateQuery<DocumentType<Entity>> {
    if (entity instanceof this.Model) {
      return entity.modifiedPaths().reduce((update: UpdateQuery<DocumentType<Entity>>, k) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        return { ...update, [k]: entity.get(k) };
      }, {});
    }

    return entity as UpdateQuery<DocumentType<Entity>>;
  }
}
