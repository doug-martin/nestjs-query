/* eslint-disable no-underscore-dangle */
import {
  AggregateQuery,
  AggregateResponse,
  AssemblerFactory,
  Class,
  Filter,
  FindRelationOptions,
  GetByIdOptions,
  mergeFilter,
  ModifyRelationOptions,
  Query,
} from '@nestjs-query/core';
import { Base } from '@typegoose/typegoose/lib/defaultClasses';
import { ReturnModelType, DocumentType, getModelWithString, getClass, mongoose } from '@typegoose/typegoose';
import { NotFoundException } from '@nestjs/common';
import { AggregateBuilder, FilterQueryBuilder } from '../query';
import {
  isEmbeddedSchemaTypeOptions,
  isSchemaTypeWithReferenceOptions,
  isVirtualTypeWithReferenceOptions,
  VirtualTypeWithOptions,
} from '../typegoose-types.helper';

export abstract class ReferenceQueryService<Entity extends Base> {
  abstract readonly filterQueryBuilder: FilterQueryBuilder<Entity>;

  protected constructor(readonly Model: ReturnModelType<new () => Entity>) {}

  abstract getById(id: string | number, opts?: GetByIdOptions<Entity>): Promise<DocumentType<Entity>>;

  aggregateRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    entities: DocumentType<Entity>[],
    filter: Filter<Relation>,
    aggregate: AggregateQuery<Relation>,
  ): Promise<Map<DocumentType<Entity>, AggregateResponse<DocumentType<Relation>>[]>>;

  aggregateRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: DocumentType<Entity>,
    filter: Filter<Relation>,
    aggregate: AggregateQuery<Relation>,
  ): Promise<AggregateResponse<DocumentType<Relation>>[]>;

  async aggregateRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: DocumentType<Entity> | DocumentType<Entity>[],
    filter: Filter<Relation>,
    aggregateQuery: AggregateQuery<Relation>,
  ): Promise<
    AggregateResponse<DocumentType<Relation>>[] | Map<DocumentType<Entity>, AggregateResponse<DocumentType<Relation>>[]>
  > {
    this.checkForReference('AggregateRelations', relationName);
    const relationModel = this.getReferenceModel(relationName);
    const referenceQueryBuilder = this.getReferenceQueryBuilder(relationName);
    if (Array.isArray(dto)) {
      return dto.reduce(async (mapPromise, entity) => {
        const map = await mapPromise;
        const refs = await this.aggregateRelations(RelationClass, relationName, entity, filter, aggregateQuery);
        return map.set(entity, refs);
      }, Promise.resolve(new Map<DocumentType<Entity>, AggregateResponse<DocumentType<Relation>>[]>()));
    }
    const assembler = AssemblerFactory.getAssembler(RelationClass, this.getReferenceEntity(relationName));
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

  countRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    entities: DocumentType<Entity>[],
    filter: Filter<Relation>,
  ): Promise<Map<DocumentType<Entity>, number>>;

  countRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: DocumentType<Entity>,
    filter: Filter<Relation>,
  ): Promise<number>;

  async countRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: DocumentType<Entity> | DocumentType<Entity>[],
    filter: Filter<Relation>,
  ): Promise<number | Map<DocumentType<Entity>, number>> {
    this.checkForReference('CountRelations', relationName);
    if (Array.isArray(dto)) {
      return dto.reduce(async (mapPromise, entity) => {
        const map = await mapPromise;
        const refs = await this.countRelations(RelationClass, relationName, entity, filter);
        return map.set(entity, refs);
      }, Promise.resolve(new Map<DocumentType<Entity>, number>()));
    }
    const assembler = AssemblerFactory.getAssembler(RelationClass, this.getReferenceEntity(relationName));
    const relationModel = this.getReferenceModel(relationName);
    const referenceQueryBuilder = this.getReferenceQueryBuilder(relationName);
    const refFilter = this.getReferenceFilter(relationName, dto, assembler.convertQuery({ filter }).filter);
    if (!refFilter) {
      return 0;
    }
    return relationModel.countDocuments(referenceQueryBuilder.buildFilterQuery(refFilter)).exec();
  }

  findRelation<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dtos: DocumentType<Entity>[],
    opts?: FindRelationOptions<Relation>,
  ): Promise<Map<Entity, Relation | undefined>>;
  findRelation<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: DocumentType<Entity>,
    opts?: FindRelationOptions<Relation>,
  ): Promise<DocumentType<Relation> | undefined>;
  async findRelation<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: DocumentType<Entity> | DocumentType<Entity>[],
    opts?: FindRelationOptions<Relation>,
  ): Promise<(Relation | undefined) | Map<Entity, Relation | undefined>> {
    this.checkForReference('FindRelation', relationName);
    const referenceQueryBuilder = this.getReferenceQueryBuilder(relationName);
    if (Array.isArray(dto)) {
      return dto.reduce(async (prev, curr) => {
        const map = await prev;
        const ref = await this.findRelation(RelationClass, relationName, curr, opts);
        return map.set(curr, ref);
      }, Promise.resolve(new Map<DocumentType<Entity>, DocumentType<Relation> | undefined>()));
    }

    // eslint-disable-next-line no-underscore-dangle
    const foundEntity = await this.Model.findById(dto._id);
    if (!foundEntity) {
      return undefined;
    }
    const assembler = AssemblerFactory.getAssembler(RelationClass, this.getReferenceEntity(relationName));
    const filterQuery = referenceQueryBuilder.buildFilterQuery(assembler.convertQuery({ filter: opts?.filter }).filter);
    const populated = await foundEntity.populate({ path: relationName, match: filterQuery }).execPopulate();
    const populatedRef: unknown = populated.get(relationName);
    return populatedRef ? assembler.convertToDTO(populatedRef) : undefined;
  }

  queryRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    entities: DocumentType<Entity>[],
    query: Query<Relation>,
  ): Promise<Map<DocumentType<Entity>, DocumentType<Relation>[]>>;
  queryRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: DocumentType<Entity>,
    query: Query<Relation>,
  ): Promise<DocumentType<Relation>[]>;
  async queryRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: DocumentType<Entity> | DocumentType<Entity>[],
    query: Query<Relation>,
  ): Promise<Relation[] | Map<Entity, Relation[]>> {
    this.checkForReference('QueryRelations', relationName);
    const referenceQueryBuilder = this.getReferenceQueryBuilder<Relation>(relationName);
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
    const assembler = AssemblerFactory.getAssembler(RelationClass, this.getReferenceEntity(relationName));
    const { filterQuery, options } = referenceQueryBuilder.buildQuery(assembler.convertQuery(query));
    const populated = await foundEntity.populate({ path: relationName, match: filterQuery, options }).execPopulate();
    return assembler.convertToDTOs(populated.get(relationName));
  }

  async addRelations<Relation>(
    relationName: string,
    id: string,
    relationIds: (string | number)[],
    opts?: ModifyRelationOptions<Entity, Relation>,
  ): Promise<DocumentType<Entity>> {
    this.checkForReference('AddRelations', relationName, false);
    const refCount = await this.getRefCount(relationName, relationIds, opts?.relationFilter);
    if (relationIds.length !== refCount) {
      throw new Error(`Unable to find all ${relationName} to add to ${this.Model.modelName}`);
    }

    const entity = await this.findAndUpdate(
      id,
      opts?.filter as Filter<Entity>,
      { $push: { [relationName]: { $each: relationIds } } } as mongoose.UpdateQuery<DocumentType<Entity>>,
    );

    return entity;
  }

  async setRelations<Relation>(
    relationName: string,
    id: string,
    relationIds: (string | number)[],
    opts?: ModifyRelationOptions<Entity, Relation>,
  ): Promise<DocumentType<Entity>> {
    this.checkForReference('AddRelations', relationName, false);
    const refCount = await this.getRefCount(relationName, relationIds, opts?.relationFilter);
    if (relationIds.length !== refCount) {
      throw new Error(`Unable to find all ${relationName} to set on ${this.Model.modelName}`);
    }
    const entity = await this.findAndUpdate(
      id,
      opts?.filter as Filter<Entity>,
      { [relationName]: relationIds } as mongoose.UpdateQuery<DocumentType<Entity>>,
    );
    return entity;
  }

  async setRelation<Relation>(
    relationName: string,
    id: string | number,
    relationId: string | number,
    opts?: ModifyRelationOptions<Entity, Relation>,
  ): Promise<DocumentType<Entity>> {
    this.checkForReference('SetRelation', relationName, false);
    const refCount = await this.getRefCount(relationName, [relationId], opts?.relationFilter);
    if (refCount !== 1) {
      throw new Error(`Unable to find ${relationName} to set on ${this.Model.modelName}`);
    }
    const entity = await this.findAndUpdate(
      id,
      opts?.filter as Filter<Entity>,
      { [relationName]: relationId } as mongoose.UpdateQuery<DocumentType<Entity>>,
    );

    // reload the document
    return entity;
  }

  async removeRelation<Relation>(
    relationName: string,
    id: string | number,
    relationId: string | number,
    opts?: ModifyRelationOptions<Entity, Relation>,
  ): Promise<DocumentType<Entity>> {
    this.checkForReference('RemoveRelation', relationName, false);
    const refCount = await this.getRefCount(relationName, [relationId], opts?.relationFilter);
    if (refCount !== 1) {
      throw new Error(`Unable to find ${relationName} to remove from ${this.Model.modelName}`);
    }

    await this.findAndUpdate(
      id,
      opts?.filter as Filter<Entity>,
      { $unset: { [relationName]: relationId } } as mongoose.UpdateQuery<DocumentType<Entity>>,
    );

    // reload the document
    return this.getById(id);
  }

  async removeRelations<Relation>(
    relationName: string,
    id: string | number,
    relationIds: string[] | number[],
    opts?: ModifyRelationOptions<Entity, Relation>,
  ): Promise<DocumentType<Entity>> {
    this.checkForReference('RemoveRelations', relationName, false);
    const refCount = await this.getRefCount(relationName, relationIds, opts?.relationFilter);
    if (relationIds.length !== refCount) {
      throw new Error(`Unable to find all ${relationName} to remove from ${this.Model.modelName}`);
    }
    if (this.isVirtualPath(relationName)) {
      throw new Error(`RemoveRelations not supported for virtual relation ${relationName}`);
    }
    await this.findAndUpdate(
      id,
      opts?.filter as Filter<Entity>,
      { $pullAll: { [relationName]: relationIds } } as mongoose.UpdateQuery<DocumentType<Entity>>,
    );

    // reload the document
    return this.getById(id);
  }

  private getReferenceEntity(relationName: string) {
    const ReferenceModel = this.getReferenceModel(relationName);
    return getClass(ReferenceModel.modelName) as Class<unknown>;
  }

  private isReferencePath(refName: string): boolean {
    return !!this.Model.schema.path(refName);
  }

  private isVirtualPath(refName: string): boolean {
    return !!this.Model.schema.virtualpath(refName);
  }

  private getReferenceFilter<Relation>(
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

  private getObjectIdReferenceFilter<Ref>(refName: string, entity: Entity, filter?: Filter<Ref>): Filter<Ref> {
    const referenceIds = entity[refName as keyof Entity];
    const refFilter = {
      _id: { [Array.isArray(referenceIds) ? 'in' : 'eq']: referenceIds },
    } as unknown as Filter<Ref>;
    return mergeFilter(filter ?? ({} as Filter<Ref>), refFilter);
  }

  private getVirtualReferenceFilter<Ref>(
    virtualType: VirtualTypeWithOptions,
    entity: Entity,
    filter?: Filter<Ref>,
  ): Filter<Ref> {
    const { foreignField, localField } = virtualType.options;
    const refVal = entity[localField as keyof Entity];
    const isArray = Array.isArray(refVal);
    const lookupFilter = {
      [foreignField as keyof Ref]: { [isArray ? 'in' : 'eq']: refVal },
    } as unknown as Filter<Ref>;
    return mergeFilter(filter ?? ({} as Filter<Ref>), lookupFilter);
  }

  private getReferenceModel<Ref>(refName: string): ReturnModelType<Class<Ref>> {
    let refModel: ReturnModelType<Class<Ref>> | undefined;
    if (this.isReferencePath(refName)) {
      const schemaType = this.Model.schema.path(refName);
      if (isEmbeddedSchemaTypeOptions(schemaType)) {
        refModel = getModelWithString(schemaType.$embeddedSchemaType.options.ref);
      } else if (isSchemaTypeWithReferenceOptions(schemaType)) {
        refModel = getModelWithString(schemaType.options.ref);
      }
    } else if (this.isVirtualPath(refName)) {
      const schemaType = this.Model.schema.virtualpath(refName);
      if (isVirtualTypeWithReferenceOptions(schemaType)) {
        refModel = getModelWithString(schemaType.options.ref);
      }
    }
    if (!refModel) {
      throw new Error(`Unable to lookup reference type for ${refName}`);
    }
    return refModel;
  }

  private getRefCount<Relation extends Document>(
    relationName: string,
    relationIds: (string | number)[],
    filter?: Filter<Relation>,
  ): Promise<number> {
    const referenceModel = this.getReferenceModel(relationName);
    const referenceQueryBuilder = this.getReferenceQueryBuilder(relationName);
    return referenceModel.countDocuments(referenceQueryBuilder.buildIdFilterQuery(relationIds, filter)).exec();
  }

  private getReferenceQueryBuilder<Ref>(refName: string): FilterQueryBuilder<Ref> {
    return new FilterQueryBuilder<Ref>(this.getReferenceModel(refName));
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

  private async findAndUpdate(
    id: string | number,
    filter: Filter<Entity>,
    query: mongoose.UpdateQuery<DocumentType<Entity>>,
  ): Promise<DocumentType<Entity>> {
    const entity = await this.Model.findOneAndUpdate(this.filterQueryBuilder.buildIdFilterQuery(id, filter), query, {
      new: true,
    }).exec();
    if (!entity) {
      throw new NotFoundException(`Unable to find ${this.Model.modelName} with id: ${id}`);
    }

    return entity;
  }
}
