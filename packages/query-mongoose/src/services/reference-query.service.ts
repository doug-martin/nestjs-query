/* eslint-disable no-underscore-dangle */
import {
  AggregateQuery,
  AggregateResponse,
  Class,
  Filter,
  FindRelationOptions,
  GetByIdOptions,
  mergeFilter,
  ModifyRelationOptions,
  Query,
  AssemblerFactory,
} from '@nestjs-query/core';
import { Document, Model as MongooseModel, UpdateQuery } from 'mongoose';
import { AggregateBuilder, FilterQueryBuilder } from '../query';
import {
  isEmbeddedSchemaTypeOptions,
  isSchemaTypeWithReferenceOptions,
  isVirtualTypeWithReferenceOptions,
  VirtualTypeWithOptions,
} from '../mongoose-types.helper';

export abstract class ReferenceQueryService<Entity extends Document> {
  abstract readonly Model: MongooseModel<Entity>;

  abstract getById(id: string | number, opts?: GetByIdOptions<Entity>): Promise<Entity>;

  aggregateRelations<Relation extends Document>(
    RelationClass: Class<Relation>,
    relationName: string,
    entities: Entity[],
    filter: Filter<Relation>,
    aggregate: AggregateQuery<Relation>,
  ): Promise<Map<Entity, AggregateResponse<Relation>[]>>;

  aggregateRelations<Relation extends Document>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: Entity,
    filter: Filter<Relation>,
    aggregate: AggregateQuery<Relation>,
  ): Promise<AggregateResponse<Relation>[]>;

  async aggregateRelations<Relation extends Document>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: Entity | Entity[],
    filter: Filter<Relation>,
    aggregateQuery: AggregateQuery<Relation>,
  ): Promise<AggregateResponse<Relation>[] | Map<Entity, AggregateResponse<Relation>[]>> {
    this.checkForReference('AggregateRelations', relationName);
    const relationModel = this.getReferenceModel(relationName);
    const referenceQueryBuilder = this.getReferenceQueryBuilder(relationName);
    if (Array.isArray(dto)) {
      return dto.reduce(async (mapPromise, entity) => {
        const map = await mapPromise;
        const refs = await this.aggregateRelations(RelationClass, relationName, entity, filter, aggregateQuery);
        return map.set(entity, refs);
      }, Promise.resolve(new Map<Entity, AggregateResponse<Relation>[]>()));
    }
    const assembler = AssemblerFactory.getAssembler(RelationClass, Document);
    const refFilter = this.getReferenceFilter(relationName, dto, assembler.convertQuery({ filter }).filter);
    if (!refFilter) {
      return [];
    }
    const { filterQuery, aggregate, options } = referenceQueryBuilder.buildAggregateQuery(
      assembler.convertAggregateQuery(aggregateQuery),
      refFilter,
    );
    const aggPipeline: unknown[] = [{ $match: filterQuery }, { $group: aggregate }];
    if (options.sort) {
      aggPipeline.push({ $sort: options.sort ?? {} });
    }
    const aggResult = (await relationModel.aggregate<Record<string, unknown>>(aggPipeline).exec()) as Record<
      string,
      unknown
    >[];
    return AggregateBuilder.convertToAggregateResponse(aggResult);
  }

  countRelations<Relation extends Document>(
    RelationClass: Class<Relation>,
    relationName: string,
    entities: Entity[],
    filter: Filter<Relation>,
  ): Promise<Map<Entity, number>>;

  countRelations<Relation extends Document>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: Entity,
    filter: Filter<Relation>,
  ): Promise<number>;

  async countRelations<Relation extends Document>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: Entity | Entity[],
    filter: Filter<Relation>,
  ): Promise<number | Map<Entity, number>> {
    this.checkForReference('CountRelations', relationName);
    if (Array.isArray(dto)) {
      return dto.reduce(async (mapPromise, entity) => {
        const map = await mapPromise;
        const refs = await this.countRelations(RelationClass, relationName, entity, filter);
        return map.set(entity, refs);
      }, Promise.resolve(new Map<Entity, number>()));
    }
    const assembler = AssemblerFactory.getAssembler(RelationClass, Document);
    const relationModel = this.getReferenceModel(relationName);
    const referenceQueryBuilder = this.getReferenceQueryBuilder(relationName);
    const refFilter = this.getReferenceFilter(relationName, dto, assembler.convertQuery({ filter }).filter);
    if (!refFilter) {
      return 0;
    }
    return relationModel.count(referenceQueryBuilder.buildFilterQuery(refFilter)).exec();
  }

  findRelation<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dtos: Entity[],
    opts?: FindRelationOptions<Relation>,
  ): Promise<Map<Entity, Relation | undefined>>;
  findRelation<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: Entity,
    opts?: FindRelationOptions<Relation>,
  ): Promise<Relation | undefined>;
  async findRelation<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: Entity | Entity[],
    opts?: FindRelationOptions<Relation>,
  ): Promise<(Relation | undefined) | Map<Entity, Relation | undefined>> {
    this.checkForReference('FindRelation', relationName);
    const referenceQueryBuilder = this.getReferenceQueryBuilder(relationName);
    if (Array.isArray(dto)) {
      return dto.reduce(async (prev, curr) => {
        const map = await prev;
        const ref = await this.findRelation(RelationClass, relationName, curr, opts);
        return map.set(curr, ref);
      }, Promise.resolve(new Map<Entity, Relation | undefined>()));
    }
    const foundEntity = await this.Model.findById(dto._id ?? dto.id);
    if (!foundEntity) {
      return undefined;
    }
    const assembler = AssemblerFactory.getAssembler(RelationClass, Document);
    const filterQuery = referenceQueryBuilder.buildFilterQuery(assembler.convertQuery({ filter: opts?.filter }).filter);
    const populated = await foundEntity.populate({ path: relationName, match: filterQuery }).execPopulate();
    const populatedRef: unknown = populated.get(relationName);
    return populatedRef ? assembler.convertToDTO(populatedRef as Document) : undefined;
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
  async queryRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: Entity | Entity[],
    query: Query<Relation>,
  ): Promise<Relation[] | Map<Entity, Relation[]>> {
    this.checkForReference('QueryRelations', relationName);
    const referenceQueryBuilder = this.getReferenceQueryBuilder(relationName);
    if (Array.isArray(dto)) {
      return dto.reduce(async (mapPromise, entity) => {
        const map = await mapPromise;
        const refs = await this.queryRelations(RelationClass, relationName, entity, query);
        return map.set(entity, refs);
      }, Promise.resolve(new Map<Entity, Relation[]>()));
    }
    const foundEntity = await this.Model.findById(dto._id ?? dto.id);
    if (!foundEntity) {
      return [];
    }
    const assembler = AssemblerFactory.getAssembler(RelationClass, Document);
    const { filterQuery, options } = referenceQueryBuilder.buildQuery(assembler.convertQuery(query));
    const populated = await foundEntity.populate({ path: relationName, match: filterQuery, options }).execPopulate();
    return assembler.convertToDTOs(populated.get(relationName) as Document[]);
  }

  async addRelations<Relation extends Document>(
    relationName: string,
    id: string,
    relationIds: (string | number)[],
    opts?: ModifyRelationOptions<Entity, Relation>,
  ): Promise<Entity> {
    this.checkForReference('AddRelations', relationName, false);
    const entity = await this.getById(id, opts);
    const refCount = await this.getRefCount(relationName, relationIds, opts?.relationFilter);
    if (relationIds.length !== refCount) {
      throw new Error(`Unable to find all ${relationName} to add to ${this.Model.modelName}`);
    }
    await entity.updateOne({ $push: { [relationName]: { $each: relationIds } } } as UpdateQuery<Entity>).exec();
    // reload the document
    return this.getById(id);
  }

  async setRelation<Relation extends Document>(
    relationName: string,
    id: string | number,
    relationId: string | number,
    opts?: ModifyRelationOptions<Entity, Relation>,
  ): Promise<Entity> {
    this.checkForReference('SetRelation', relationName, false);
    const entity = await this.getById(id, opts);
    const refCount = await this.getRefCount(relationName, [relationId], opts?.relationFilter);
    if (refCount !== 1) {
      throw new Error(`Unable to find ${relationName} to set on ${this.Model.modelName}`);
    }
    await entity.updateOne({ [relationName]: relationId } as UpdateQuery<Entity>).exec();
    // reload the document
    return this.getById(id);
  }

  async removeRelation<Relation extends Document>(
    relationName: string,
    id: string | number,
    relationId: string | number,
    opts?: ModifyRelationOptions<Entity, Relation>,
  ): Promise<Entity> {
    this.checkForReference('RemoveRelation', relationName, false);
    const entity = await this.getById(id, opts);
    const refCount = await this.getRefCount(relationName, [relationId], opts?.relationFilter);
    if (refCount !== 1) {
      throw new Error(`Unable to find ${relationName} to remove from ${this.Model.modelName}`);
    }
    await entity
      .updateOne({
        $unset: { [relationName]: relationId },
      } as UpdateQuery<Entity>)
      .exec();
    // reload the document
    return this.getById(id);
  }

  async removeRelations<Relation extends Document>(
    relationName: string,
    id: string | number,
    relationIds: string[] | number[],
    opts?: ModifyRelationOptions<Entity, Relation>,
  ): Promise<Entity> {
    this.checkForReference('RemoveRelations', relationName, false);
    const entity = await this.getById(id, opts);
    const refCount = await this.getRefCount(relationName, relationIds, opts?.relationFilter);
    if (relationIds.length !== refCount) {
      throw new Error(`Unable to find all ${relationName} to remove from ${this.Model.modelName}`);
    }
    if (this.isVirtualPath(relationName)) {
      throw new Error(`RemoveRelations not supported for virtual relation ${relationName}`);
    }
    await entity
      .updateOne({
        $pullAll: { [relationName]: relationIds },
      } as UpdateQuery<Entity>)
      .exec();
    // reload the document
    return this.getById(id);
  }

  private checkForReference(operation: string, refName: string, allowVirtual = true): void {
    if (this.isReferencePath(refName)) {
      return;
    }
    if (this.isVirtualPath(refName)) {
      if (allowVirtual) {
        return;
      }
      throw new Error(`${operation} not supported for virtual relation ${refName}`);
    }
    throw new Error(`Unable to find reference ${refName} on ${this.Model.modelName}`);
  }

  private isReferencePath(refName: string): boolean {
    return !!this.Model.schema.path(refName);
  }

  private isVirtualPath(refName: string): boolean {
    return !!this.Model.schema.virtualpath(refName);
  }

  private getReferenceQueryBuilder<Ref extends Document>(refName: string): FilterQueryBuilder<Ref> {
    return new FilterQueryBuilder<Ref>(this.getReferenceModel(refName));
  }

  private getReferenceModel<Ref extends Document>(refName: string): MongooseModel<Ref> {
    const { db } = this.Model;
    if (this.isReferencePath(refName)) {
      const schemaType = this.Model.schema.path(refName);
      if (isEmbeddedSchemaTypeOptions(schemaType)) {
        return db.model<Ref>(schemaType.$embeddedSchemaType.options.ref);
      }
      if (isSchemaTypeWithReferenceOptions(schemaType)) {
        return db.model<Ref>(schemaType.options.ref);
      }
    } else if (this.isVirtualPath(refName)) {
      const schemaType = this.Model.schema.virtualpath(refName);
      if (isVirtualTypeWithReferenceOptions(schemaType)) {
        return db.model<Ref>(schemaType.options.ref);
      }
    }
    throw new Error(`Unable to lookup reference type for ${refName}`);
  }

  private getReferenceFilter<Relation extends Document>(
    refName: string,
    entity: Entity,
    filter?: Filter<Relation>,
  ): Filter<Relation> | undefined {
    if (this.isReferencePath(refName)) {
      return this.getObjectIdReferenceFilter(refName, entity, filter);
    }
    if (this.isVirtualPath(refName)) {
      const virtualType = this.Model.schema.virtualpath(refName);
      if (isVirtualTypeWithReferenceOptions(virtualType)) {
        return this.getVirtualReferenceFilter(virtualType, entity, filter);
      }
      throw new Error(`Unable to lookup reference type for ${refName}`);
    }
    return undefined;
  }

  private getObjectIdReferenceFilter<Ref extends Document>(
    refName: string,
    entity: Entity,
    filter?: Filter<Ref>,
  ): Filter<Ref> {
    const referenceIds = entity[refName as keyof Entity];
    const refFilter = ({
      _id: { [Array.isArray(referenceIds) ? 'in' : 'eq']: referenceIds },
    } as unknown) as Filter<Ref>;
    return mergeFilter(filter ?? ({} as Filter<Ref>), refFilter);
  }

  private getVirtualReferenceFilter<Ref extends Document>(
    virtualType: VirtualTypeWithOptions,
    entity: Entity,
    filter?: Filter<Ref>,
  ): Filter<Ref> {
    const { foreignField, localField } = virtualType.options;
    const refVal = entity[localField as keyof Entity];
    const isArray = Array.isArray(refVal);
    const lookupFilter = ({
      [foreignField as keyof Ref]: { [isArray ? 'in' : 'eq']: refVal },
    } as unknown) as Filter<Ref>;
    return mergeFilter(filter ?? ({} as Filter<Ref>), lookupFilter);
  }

  private getRefCount<Relation extends Document>(
    relationName: string,
    relationIds: (string | number)[],
    filter?: Filter<Relation>,
  ): Promise<number> {
    const referenceModel = this.getReferenceModel<Relation>(relationName);
    const referenceQueryBuilder = this.getReferenceQueryBuilder<Relation>(relationName);
    return referenceModel.count(referenceQueryBuilder.buildIdFilterQuery(relationIds, filter)).exec();
  }
}
