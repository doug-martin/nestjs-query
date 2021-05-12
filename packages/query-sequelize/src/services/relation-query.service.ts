import {
  Query,
  Class,
  AssemblerFactory,
  Filter,
  AggregateQuery,
  AggregateResponse,
  ModifyRelationOptions,
  GetByIdOptions,
  FindRelationOptions,
} from '@nestjs-query/core';
import { Model, ModelCtor } from 'sequelize-typescript';
import { ModelCtor as SequelizeModelCtor } from 'sequelize';
import { AggregateBuilder, FilterQueryBuilder } from '../query';

interface SequelizeAssociation {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  target: SequelizeModelCtor<any>;
  isMultiAssociation: boolean;
  isSingleAssociation: boolean;
}
/**
 * Base class to house relations loading.
 * @internal
 */
export abstract class RelationQueryService<Entity extends Model<Entity, Partial<Entity>>> {
  abstract filterQueryBuilder: FilterQueryBuilder<Entity>;

  abstract model: ModelCtor<Entity>;

  abstract getById(id: string | number, opts?: GetByIdOptions<Entity>): Promise<Entity>;

  /**
   * Query for relations for an array of Entities. This method will return a map with the Entity as the key and the relations as the value.
   * @param RelationClass - The class of the relation.
   * @param relationName - The name of the relation to load.
   * @param entities - the dtos to find relations for.
   * @param query - A query to use to filter, page, and sort relations.
   */
  async queryRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    entities: Entity[],
    query: Query<Relation>,
  ): Promise<Map<Entity, Relation[]>>;

  /**
   * Query for an array of relations.
   * @param RelationClass - The class to serialize the relations into.
   * @param dto - The dto to query relations for.
   * @param relationName - The name of relation to query for.
   * @param query - A query to filter, page and sort relations.
   */
  async queryRelations<Relation>(
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
    if (Array.isArray(dto)) {
      return this.batchQueryRelations(RelationClass, relationName, dto, query);
    }
    const relationEntity = this.getRelationEntity(relationName);
    const assembler = AssemblerFactory.getAssembler(RelationClass, relationEntity);
    const relationQueryBuilder = this.getRelationQueryBuilder<Model>(relationEntity);
    const relations = await this.ensureIsEntity(dto).$get(
      relationName as keyof Entity,
      relationQueryBuilder.findOptions(assembler.convertQuery(query)),
    );
    return assembler.convertToDTOs(relations as unknown as Model[]);
  }

  async aggregateRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    entities: Entity[],
    filter: Filter<Relation>,
    aggregate: AggregateQuery<Relation>,
  ): Promise<Map<Entity, AggregateResponse<Relation>[]>>;

  /**
   * Query for an array of relations.
   * @param RelationClass - The class to serialize the relations into.
   * @param dto - The dto to query relations for.
   * @param relationName - The name of relation to query for.
   * @param filter - Filter for relations to aggregate on.
   * @param aggregate - Aggregate query
   */
  async aggregateRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: Entity,
    filter: Filter<Relation>,
    aggregate: AggregateQuery<Relation>,
  ): Promise<AggregateResponse<Relation>[]>;

  async aggregateRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: Entity | Entity[],
    filter: Filter<Relation>,
    aggregate: AggregateQuery<Relation>,
  ): Promise<AggregateResponse<Relation>[] | Map<Entity, AggregateResponse<Relation>[]>> {
    if (Array.isArray(dto)) {
      return this.batchAggregateRelations(RelationClass, relationName, dto, filter, aggregate);
    }
    const relationEntity = this.getRelationEntity(relationName);
    const assembler = AssemblerFactory.getAssembler(RelationClass, relationEntity);
    const relationQueryBuilder = this.getRelationQueryBuilder<Model>(relationEntity);
    const results = (await this.ensureIsEntity(dto).$get(
      relationName as keyof Entity,
      relationQueryBuilder.relationAggregateOptions(
        assembler.convertQuery({ filter }),
        assembler.convertAggregateQuery(aggregate),
      ),
    )) as unknown as Record<string, unknown>[];
    return AggregateBuilder.convertToAggregateResponse(results).map((a) => assembler.convertAggregateResponse(a));
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

  async countRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: Entity | Entity[],
    filter: Filter<Relation>,
  ): Promise<number | Map<Entity, number>> {
    if (Array.isArray(dto)) {
      return this.batchCountRelations(RelationClass, relationName, dto, filter);
    }
    const relationEntity = this.getRelationEntity(relationName);
    const assembler = AssemblerFactory.getAssembler(RelationClass, relationEntity);
    const relationQueryBuilder = this.getRelationQueryBuilder<Model>(relationEntity);
    return this.ensureIsEntity(dto).$count(
      relationName,
      relationQueryBuilder.countOptions(assembler.convertQuery({ filter })),
    );
  }

  /**
   * Find a relation for an array of Entities. This will return a Map where the key is the Entity and the value is to
   * relation or undefined if not found.
   * @param RelationClass - the class of the relation
   * @param relationName - the name of the relation to load.
   * @param dtos - the dtos to find the relation for.
   * @param opts - Additional options
   */
  async findRelation<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dtos: Entity[],
    opts?: FindRelationOptions<Relation>,
  ): Promise<Map<Entity, Relation | undefined>>;

  /**
   * Finds a single relation.
   * @param RelationClass - The class to serialize the relation into.
   * @param dto - The dto to find the relation for.
   * @param relationName - The name of the relation to query for.
   * @param opts - Additional options
   */
  async findRelation<Relation>(
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
    if (Array.isArray(dto)) {
      return this.batchFindRelations(RelationClass, relationName, dto, opts);
    }
    const relationEntity = this.getRelationEntity(relationName);
    const assembler = AssemblerFactory.getAssembler(RelationClass, relationEntity);
    const relationQueryBuilder = this.getRelationQueryBuilder(relationEntity);
    const relation = await this.ensureIsEntity(dto).$get(
      relationName as keyof Entity,
      relationQueryBuilder.findOptions(opts ?? {}),
    );
    if (!relation) {
      return undefined;
    }
    return assembler.convertToDTO(relation as unknown as Model);
  }

  /**
   * Add a single relation.
   * @param id - The id of the entity to add the relation to.
   * @param relationName - The name of the relation to query for.
   * @param relationIds - The ids of relations to add.
   * @param opts - Additional options
   */
  async addRelations<Relation>(
    relationName: string,
    id: string | number,
    relationIds: string[] | number[],
    opts?: ModifyRelationOptions<Entity, Relation>,
  ): Promise<Entity> {
    const entity = await this.getById(id, opts);
    const relations = await this.getRelations(relationName, relationIds, opts?.relationFilter);
    if (!this.foundAllRelations(relationIds, relations)) {
      throw new Error(`Unable to find all ${relationName} to add to ${this.model.name}`);
    }
    await entity.$add(relationName, relationIds);
    return entity;
  }

  /**
   * Set the relations on the entity.
   *
   * @param id - The id of the entity to set the relation on.
   * @param relationName - The name of the relation to query for.
   * @param relationIds - The ids of the relation to set on the entity. If the relationIds is empty all relations
   * will be removed.
   * @param opts - Additional options
   */
  async setRelations<Relation>(
    relationName: string,
    id: string | number,
    relationIds: string[] | number[],
    opts?: ModifyRelationOptions<Entity, Relation>,
  ): Promise<Entity> {
    const entity = await this.getById(id, opts);
    if (relationIds.length) {
      const relations = await this.getRelations(relationName, relationIds, opts?.relationFilter);
      if (relations.length !== relationIds.length) {
        throw new Error(`Unable to find all ${relationName} to set on ${this.model.name}`);
      }
    }
    await entity.$set(relationName as keyof Entity, relationIds);
    return entity;
  }

  /**
   * Set the relation on the entity.
   *
   * @param id - The id of the entity to set the relation on.
   * @param relationName - The name of the relation to query for.
   * @param relationId - The id of the relation to set on the entity.
   * @param opts - Additional options
   */
  async setRelation<Relation>(
    relationName: string,
    id: string | number,
    relationId: string | number,
    opts?: ModifyRelationOptions<Entity, Relation>,
  ): Promise<Entity> {
    const entity = await this.getById(id, opts);
    const relation = (await this.getRelations(relationName, [relationId], opts?.relationFilter))[0];
    if (!relation) {
      throw new Error(`Unable to find ${relationName} to set on ${this.model.name}`);
    }
    await entity.$set(relationName as keyof Entity, relationId);
    return entity;
  }

  /**
   * Removes multiple relations.
   * @param id - The id of the entity to add the relation to.
   * @param relationName - The name of the relation to query for.
   * @param relationIds - The ids of the relations to add.
   * @param opts - Additional options
   */
  async removeRelations<Relation>(
    relationName: string,
    id: string | number,
    relationIds: string[] | number[],
    opts?: ModifyRelationOptions<Entity, Relation>,
  ): Promise<Entity> {
    const entity = await this.getById(id, opts);
    const relations = await this.getRelations(relationName, relationIds, opts?.relationFilter);
    if (!this.foundAllRelations(relationIds, relations)) {
      throw new Error(`Unable to find all ${relationName} to remove from ${this.model.name}`);
    }
    await entity.$remove(relationName, relationIds);
    return entity;
  }

  /**
   * Remove the relation on the entity.
   *
   * @param id - The id of the entity to set the relation on.
   * @param relationName - The name of the relation to query for.
   * @param relationId - The id of the relation to set on the entity.
   * @param opts - Additional options
   */
  async removeRelation<Relation>(
    relationName: string,
    id: string | number,
    relationId: string | number,
    opts?: ModifyRelationOptions<Entity, Relation>,
  ): Promise<Entity> {
    const entity = await this.getById(id, opts);
    const association = this.getAssociation(relationName);
    const relation = (await this.getRelations(relationName, [relationId], opts?.relationFilter))[0];
    if (!relation) {
      throw new Error(`Unable to find ${relationName} to remove from ${this.model.name}`);
    }
    if (association.isSingleAssociation) {
      // todo update that this line to remove the casting once https://github.com/RobinBuschmann/sequelize-typescript/issues/803 is addressed.
      await entity.$set(relationName as keyof Entity, null as unknown as string);
    } else {
      await entity.$remove(relationName, relationId);
    }
    return entity;
  }

  getRelationQueryBuilder<Relation extends Model>(model: ModelCtor<Relation>): FilterQueryBuilder<Relation> {
    return new FilterQueryBuilder<Relation>(model);
  }

  /**
   * Query for an array of relations for multiple dtos.
   * @param RelationClass - The class to serialize the relations into.
   * @param entities - The entities to query relations for.
   * @param relationName - The name of relation to query for.
   * @param query - A query to filter, page or sort relations.
   */
  private async batchQueryRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    entities: Entity[],
    query: Query<Relation>,
  ): Promise<Map<Entity, Relation[]>> {
    const relationEntity = this.getRelationEntity(relationName);
    const assembler = AssemblerFactory.getAssembler(RelationClass, relationEntity);
    const relationQueryBuilder = this.getRelationQueryBuilder(relationEntity);
    const findOptions = relationQueryBuilder.findOptions(assembler.convertQuery(query));
    return entities.reduce(async (mapPromise, e) => {
      const map = await mapPromise;
      const relations = await this.ensureIsEntity(e).$get(relationName as keyof Entity, findOptions);
      map.set(e, assembler.convertToDTOs(relations as unknown as Model[]));
      return map;
    }, Promise.resolve(new Map<Entity, Relation[]>()));
  }

  private async batchAggregateRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    entities: Entity[],
    filter: Filter<Relation>,
    aggregate: AggregateQuery<Relation>,
  ): Promise<Map<Entity, AggregateResponse<Relation>[]>> {
    const relationEntity = this.getRelationEntity(relationName);
    const assembler = AssemblerFactory.getAssembler(RelationClass, relationEntity);
    const relationQueryBuilder = this.getRelationQueryBuilder(relationEntity);
    const findOptions = relationQueryBuilder.relationAggregateOptions(
      assembler.convertQuery({ filter }),
      assembler.convertAggregateQuery(aggregate),
    );
    return entities.reduce(async (mapPromise, e) => {
      const map = await mapPromise;
      const results = (await this.ensureIsEntity(e).$get(relationName as keyof Entity, findOptions)) as Record<
        string,
        unknown
      >[];
      const aggResponse = AggregateBuilder.convertToAggregateResponse(results).map((agg) =>
        assembler.convertAggregateResponse(agg),
      );
      map.set(e, aggResponse);
      return map;
    }, Promise.resolve(new Map<Entity, AggregateResponse<Relation>[]>()));
  }

  private async batchCountRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    entities: Entity[],
    filter: Filter<Relation>,
  ): Promise<Map<Entity, number>> {
    const relationEntity = this.getRelationEntity(relationName);
    const assembler = AssemblerFactory.getAssembler(RelationClass, relationEntity);
    const relationQueryBuilder = this.getRelationQueryBuilder<Model>(relationEntity);
    const findOptions = relationQueryBuilder.countOptions(assembler.convertQuery({ filter }));
    return entities.reduce(async (mapPromise, e) => {
      const map = await mapPromise;
      const count = await this.ensureIsEntity(e).$count(relationName, findOptions);
      map.set(e, count);
      return map;
    }, Promise.resolve(new Map<Entity, number>()));
  }

  private async batchFindRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dtos: Entity[],
    opts?: FindRelationOptions<Relation>,
  ): Promise<Map<Entity, Relation | undefined>> {
    const relationEntity = this.getRelationEntity(relationName);
    const assembler = AssemblerFactory.getAssembler(RelationClass, relationEntity);
    const relationQueryBuilder = this.getRelationQueryBuilder(relationEntity);
    return dtos.reduce(async (mapPromise, e) => {
      const map = await mapPromise;
      const relation = await this.ensureIsEntity(e).$get(
        relationName as keyof Entity,
        relationQueryBuilder.findOptions(opts ?? {}),
      );
      if (relation) {
        map.set(e, assembler.convertToDTO(relation as unknown as Model));
      }
      return map;
    }, Promise.resolve(new Map<Entity, Relation | undefined>()));
  }

  private ensureIsEntity(e: Entity): Entity {
    if (!(e instanceof this.model)) {
      return this.model.build(e);
    }
    return e;
  }

  private getAssociation(relationName: string): SequelizeAssociation {
    const association = this.model.associations[relationName];
    if (!association) {
      throw new Error(`Unable to find relation ${relationName} on ${this.model.name}`);
    }
    return association;
  }

  private getRelationEntity(relationName: string): ModelCtor {
    return this.getAssociation(relationName).target as ModelCtor;
  }

  private getRelations<Relation>(
    relationName: string,
    ids: (string | number)[],
    filter?: Filter<Relation>,
  ): Promise<Model[]> {
    const relationEntity = this.getRelationEntity(relationName);
    const relationQueryBuilder = this.getRelationQueryBuilder(relationEntity);
    const findOptions = relationQueryBuilder.findByIdOptions(ids, { filter });
    return relationEntity.findAll({ ...findOptions, attributes: [...relationEntity.primaryKeyAttributes] });
  }

  private foundAllRelations(relationIds: (string | number)[], relations: Model[]): boolean {
    return new Set([...relationIds]).size === relations.length;
  }
}
