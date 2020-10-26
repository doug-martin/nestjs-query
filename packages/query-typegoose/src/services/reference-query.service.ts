import {
  AggregateQuery,
  AggregateResponse,
  AssemblerFactory,
  Class,
  Filter,
  FindRelationOptions,
  GetByIdOptions,
  mergeFilter,
} from '@nestjs-query/core';
import { ReturnModelType, DocumentType } from '@typegoose/typegoose';
import { AggregateBuilder, FilterQueryBuilder } from '../query';
import {
  isEmbeddedSchemaTypeOptions,
  isSchemaTypeWithReferenceOptions,
  isVirtualTypeWithReferenceOptions,
  VirtualTypeWithOptions,
} from '../typegoose-types.helper';
import { Document, Model as MongooseModel } from 'mongoose';

export abstract class ReferenceQueryService<Entity> {
  abstract readonly Model: ReturnModelType<new () => Entity>;

  abstract getById(id: string | number, opts?: GetByIdOptions<Entity>): Promise<Entity>;

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

  async aggregateRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: Entity | Entity[],
    filter: Filter<Relation>,
    aggregateQuery: AggregateQuery<Relation>,
  ): Promise<AggregateResponse<Relation> | Map<Entity, AggregateResponse<Relation>>> {
    this.checkForReference('AggregateRelations', relationName);
    const relationModel = this.getReferenceModel(relationName);
    const referenceQueryBuilder = ReferenceQueryService.getReferenceQueryBuilder();
    if (Array.isArray(dto)) {
      return dto.reduce(async (mapPromise, entity) => {
        const map = await mapPromise;
        const refs = await this.aggregateRelations(RelationClass, relationName, entity, filter, aggregateQuery);
        return map.set(entity, refs);
      }, Promise.resolve(new Map<Entity, AggregateResponse<Relation>>()));
    }
    const assembler = AssemblerFactory.getAssembler(RelationClass, Document);
    const refFilter = this.getReferenceFilter(relationName, dto, assembler.convertQuery({ filter }).filter);
    if (!refFilter) {
      return {};
    }
    const { filterQuery, aggregate } = referenceQueryBuilder.buildAggregateQuery(
      assembler.convertAggregateQuery(aggregateQuery),
      refFilter,
    );
    const [aggResult] = (await relationModel
      .aggregate<Record<string, unknown>>([{ $match: filterQuery }, { $group: { _id: null, ...aggregate } }])
      .exec()) as Record<string, unknown>[];
    return aggResult ? AggregateBuilder.convertToAggregateResponse(aggResult) : {};
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
  ): Promise<Relation | undefined>;
  async findRelation<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: DocumentType<Entity> | DocumentType<Entity>[],
    opts?: FindRelationOptions<Relation>,
  ): Promise<(Relation | undefined) | Map<Entity, Relation | undefined>> {
    this.checkForReference('FindRelation', relationName);
    const referenceQueryBuilder = ReferenceQueryService.getReferenceQueryBuilder();
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

  static getReferenceQueryBuilder<Ref>(): FilterQueryBuilder<Ref> {
    return new FilterQueryBuilder<Ref>();
  }

  private getReferenceModel<Ref extends Document>(refName: string): MongooseModel<Ref> {
    if (this.isReferencePath(refName)) {
      const schemaType = this.Model.schema.path(refName);
      if (isEmbeddedSchemaTypeOptions(schemaType)) {
        return this.Model.model<Ref>(schemaType.$embeddedSchemaType.options.ref);
      }
      if (isSchemaTypeWithReferenceOptions(schemaType)) {
        return this.Model.model<Ref>(schemaType.options.ref);
      }
    } else if (this.isVirtualPath(refName)) {
      const schemaType = this.Model.schema.virtualpath(refName);
      if (isVirtualTypeWithReferenceOptions(schemaType)) {
        return this.Model.model<Ref>(schemaType.options.ref);
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

  // private getRefCount<Relation extends Document>(
  //   relationName: string,
  //   relationIds: (string | number)[],
  //   filter?: Filter<Relation>,
  // ): Promise<number> {
  //   const referenceModel = this.getReferenceModel<Relation>(relationName);
  //   const referenceQueryBuilder = ReferenceQueryService.getReferenceQueryBuilder<Relation>();
  //   return referenceModel.count(referenceQueryBuilder.buildIdFilterQuery(relationIds, filter)).exec();
  // }
}
