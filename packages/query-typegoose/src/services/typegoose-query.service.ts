import {
  AggregateQuery,
  AggregateResponse,
  Class,
  DeepPartial,
  DeleteManyResponse,
  Filter,
  Query,
  QueryService,
  UpdateManyResponse,
} from '@nestjs-query/core';
import { NotFoundException } from '@nestjs/common';
import { DocumentToObjectOptions, FilterQuery, UpdateQuery } from 'mongoose';
import { ReturnModelType } from '@typegoose/typegoose';
import escapeRegExp from 'lodash.escaperegexp';

export interface TypegooseQueryServiceOpts {
  documentToObjectOptions?: DocumentToObjectOptions;
}

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
export class TypegooseQueryService<Entity> implements QueryService<Entity> {
  protected readonly documentToObjectOptions: DocumentToObjectOptions;

  protected mongoOperatorMapper: Record<string, string> = {
    eq: '$eq',
    neq: '$ne',
    gt: '$gt',
    gte: '$gte',
    lt: '$lt',
    lte: '$lte',
    in: '$in',
    notIn: '$nin',
    is: '$eq',
    isNot: '$ne',
  };

  constructor(readonly Model: ReturnModelType<new () => Entity>, opts?: TypegooseQueryServiceOpts) {
    this.documentToObjectOptions = opts?.documentToObjectOptions || { virtuals: true };
  }

  protected buildExpression(filter: Filter<Entity>): FilterQuery<new () => Entity> {
    return Object.entries(filter).reduce((prev: FilterQuery<new () => Entity>, [key, value]) => {
      if (!value) {
        return prev;
      }
      if (Array.isArray(value)) {
        return {
          ...prev,
          [`$${key}`]: value.map((subFilter) => this.buildExpression(subFilter)),
        };
      }
      const findConditions = Object.entries(value).reduce(
        (prevCondition: FilterQuery<new () => Entity>, [fieldKey, fieldValue]) => {
          if (this.mongoOperatorMapper[fieldKey]) {
            return {
              ...prevCondition,
              [this.mongoOperatorMapper[fieldKey]]: fieldValue,
            };
          }
          if (['like', 'notLike', 'iLike', 'notILike'].includes(fieldKey)) {
            const regExpStr = (escapeRegExp as (str: string) => string)(fieldValue as string).replace('%', '.*');
            const regExp = new RegExp(regExpStr, fieldKey.toLowerCase().includes('ilike') ? 'i' : undefined);
            if (fieldKey.startsWith('not')) {
              return {
                ...prevCondition,
                $not: { $regex: regExp },
              };
            }
            return {
              ...prevCondition,
              $regex: regExp,
            };
          }
          return prevCondition;
        },
        {},
      );
      return {
        ...prev,
        [this.getSchemaKey(key)]: findConditions,
      };
    }, {});
  }

  private getSchemaKey(key: string): string {
    return key === 'id' ? '_id' : key;
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
    const entities = await this.Model.find(
      this.buildExpression(query.filter || {}),
      {},
      {
        limit: query.paging?.limit,
        skip: query.paging?.offset,
        sort: (query.sorting || []).map((sort) => ({
          [this.getSchemaKey(sort.field.toString())]: sort.direction.toLowerCase(),
        })),
      },
    ).exec();
    return entities.map((doc) => doc.toObject(this.documentToObjectOptions) as Entity);
  }

  aggregate(): Promise<AggregateResponse<Entity>> {
    throw new Error('Not implemented yet');
  }

  count(filter: Filter<Entity>): Promise<number> {
    return this.Model.count(this.buildExpression(filter)).exec();
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
  async findById(id: string): Promise<Entity | undefined> {
    const doc = await this.Model.findById(id);
    return doc?.toObject(this.documentToObjectOptions) as Entity;
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
  async getById(id: string): Promise<Entity> {
    const entity = await this.findById(id);
    if (!entity) {
      throw new NotFoundException(`Unable to find ${this.Model.modelName} with id: ${id}`);
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
  async createOne<C extends DeepPartial<Entity>>(record: C): Promise<Entity> {
    const doc = new this.Model(record);
    await doc.save(record);
    return doc.toObject(this.documentToObjectOptions) as Entity;
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
    return Promise.all(records.map((r) => this.createOne(r)));
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
  async updateOne<U extends DeepPartial<Entity>>(id: string, update: U): Promise<Entity> {
    this.ensureIdIsNotPresent(update);
    const doc = await this.Model.findByIdAndUpdate(id, update as UpdateQuery<new () => Entity>, { new: true });
    if (doc) {
      return doc.toObject(this.documentToObjectOptions) as Entity;
    }
    throw new NotFoundException(`Unable to find ${this.Model.modelName} with id: ${id}`);
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
    const res = (await this.Model.updateMany(
      this.buildExpression(filter),
      update as UpdateQuery<new () => Entity>,
    ).exec()) as { nModified: number };
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
   */
  async deleteOne(id: string | number): Promise<Entity> {
    const doc = await this.Model.findByIdAndDelete(id);
    if (doc) {
      return doc.toObject(this.documentToObjectOptions) as Entity;
    }
    throw new NotFoundException(`Unable to find ${this.Model.modelName} with id: ${id}`);
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
    const res = await this.Model.deleteMany(this.buildExpression(filter)).exec();
    return { deletedCount: res.deletedCount || 0 };
  }

  private ensureIdIsNotPresent(e: DeepPartial<Entity>): void {
    if (Object.keys(e).includes('id')) {
      throw new Error('Id cannot be specified when updating');
    }
  }

  addRelations<Relation>(): Promise<Entity> {
    throw new Error('Not implemented yet');
  }

  aggregateRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    entities: Entity[],
    filter: Filter<Relation>,
    aggregate: AggregateQuery<Relation>,
  ): Promise<Map<Entity, AggregateResponse<Relation>>>;

  aggregateRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: Entity,
    filter: Filter<Relation>,
    aggregate: AggregateQuery<Relation>,
  ): Promise<AggregateResponse<Relation>>;

  aggregateRelations<Relation>(): Promise<AggregateResponse<Relation> | Map<Entity, AggregateResponse<Relation>>> {
    throw new Error('Not implemented yet');
  }

  countRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    entities: Entity[],
    filter: Filter<Relation>,
  ): Promise<Map<Entity, number>>;

  countRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: Entity,
    filter: Filter<Relation>,
  ): Promise<number>;

  countRelations<Relation>(): Promise<number | Map<Entity, number>> {
    throw new Error('Not implemented yet');
  }

  findRelation<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dtos: Entity[],
  ): Promise<Map<Entity, Relation | undefined>>;
  findRelation<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: Entity,
  ): Promise<Relation | undefined>;
  findRelation<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: Entity | Entity[],
  ): Promise<(Relation | undefined) | Map<Entity, Relation | undefined>> {
    const relationModel = this.Model.model(RelationClass.name);
    const dtos: Entity[] = Array.isArray(dto) ? dto : [dto];
    return dtos.reduce(async (prev, curr) => {
      const map = await prev;
      const referenceId = curr[relationName as keyof Entity];
      if (referenceId) {
        const relationDoc = await relationModel.findOne(referenceId);
        map.set(curr, relationDoc?.toObject(this.documentToObjectOptions));
      }
      return map;
    }, Promise.resolve(new Map<Entity, Relation | undefined>()));
  }

  queryRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    entities: Entity[],
    query: Query<Relation>,
  ): Promise<Map<Entity, Relation[]>>;
  queryRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: Entity,
    query: Query<Relation>,
  ): Promise<Relation[]>;
  queryRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: Entity | Entity[],
    query: Query<Relation>,
  ): Promise<Relation[] | Map<Entity, Relation[]>> {
    const relationModel = this.Model.model(RelationClass.name) as ReturnModelType<new () => Relation>;
    const relationQS = new TypegooseQueryService(relationModel, {
      documentToObjectOptions: this.documentToObjectOptions,
    });
    const dtos: Entity[] = Array.isArray(dto) ? dto : [dto];
    return dtos.reduce(async (prev, curr) => {
      const map = await prev;
      const ids = curr[relationName as keyof Entity];
      if (Array.isArray(ids)) {
        const relQuery = {
          ...query,
          filter: {
            ...query.filter,
            id: { in: ids },
          },
        } as Query<Relation>;
        const entities = await relationQS.query(relQuery);
        const sortedEntities = ids
          .map((id: string) => {
            const mongoDBKey = '_id' as keyof Relation; // eslint complains about keys starting with underscore
            return entities.find((e) => ((e[mongoDBKey] as unknown) as string).toString() === id.toString());
          })
          .filter((e) => !!e);
        map.set(curr, sortedEntities as Relation[]);
      }
      return map;
    }, Promise.resolve(new Map<Entity, Relation[]>()));
  }

  removeRelation<Relation>(): Promise<Entity> {
    throw new Error('Not implemented yet');
  }

  removeRelations<Relation>(): Promise<Entity> {
    throw new Error('Not implemented yet');
  }

  setRelation<Relation>(): Promise<Entity> {
    throw new Error('Not implemented yet');
  }
}
