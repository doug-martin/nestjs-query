import { Query, Class, AssemblerFactory, Filter, AggregateQuery, AggregateResponse } from '@nestjs-query/core';
import { Repository, RelationQueryBuilder as TypeOrmRelationQueryBuilder, ObjectLiteral } from 'typeorm';
import lodashFilter from 'lodash.filter';
import lodashOmit from 'lodash.omit';
import { AggregateBuilder, EntityIndexRelation, FilterQueryBuilder, RelationQueryBuilder } from '../query';

interface RelationMetadata {
  // eslint-disable-next-line @typescript-eslint/ban-types
  type: string | Function;
  isOneToOne: boolean;
  isManyToOne: boolean;
}

/**
 * Base class to house relations loading.
 * @internal
 */
export abstract class RelationQueryService<Entity> {
  abstract filterQueryBuilder: FilterQueryBuilder<Entity>;

  abstract EntityClass: Class<Entity>;

  abstract repo: Repository<Entity>;

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
    const assembler = AssemblerFactory.getAssembler(RelationClass, this.getRelationEntity(relationName));
    const relationQueryBuilder = this.getRelationQueryBuilder(relationName);
    return assembler.convertAsyncToDTOs(relationQueryBuilder.select(dto, assembler.convertQuery(query)).getMany());
  }

  async aggregateRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    entities: Entity[],
    filter: Filter<Relation>,
    aggregate: AggregateQuery<Relation>,
  ): Promise<Map<Entity, AggregateResponse<Relation>>>;

  async aggregateRelations<Relation>(
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
    aggregate: AggregateQuery<Relation>,
  ): Promise<AggregateResponse<Relation> | Map<Entity, AggregateResponse<Relation>>> {
    if (Array.isArray(dto)) {
      return this.batchAggregateRelations(RelationClass, relationName, dto, filter, aggregate);
    }
    const assembler = AssemblerFactory.getAssembler(RelationClass, this.getRelationEntity(relationName));
    const relationQueryBuilder = this.getRelationQueryBuilder(relationName);
    const aggResponse = await AggregateBuilder.asyncConvertToAggregateResponse(
      relationQueryBuilder
        .aggregate(dto, assembler.convertQuery({ filter }), assembler.convertAggregateQuery(aggregate))
        .getRawOne<Record<string, unknown>>(),
    );
    return assembler.convertAggregateResponse(aggResponse);
  }

  async countRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    entities: Entity[],
    filter: Filter<Relation>,
  ): Promise<Map<Entity, number>>;

  async countRelations<Relation>(
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
    const assembler = AssemblerFactory.getAssembler(RelationClass, this.getRelationEntity(relationName));
    const relationQueryBuilder = this.getRelationQueryBuilder(relationName);
    return relationQueryBuilder.select(dto, assembler.convertQuery({ filter })).getCount();
  }

  /**
   * Find a relation for an array of Entities. This will return a Map where the key is the Entity and the value is to
   * relation or undefined if not found.
   * @param RelationClass - the class of the relation
   * @param relationName - the name of the relation to load.
   * @param dtos - the dtos to find the relation for.
   */
  async findRelation<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dtos: Entity[],
  ): Promise<Map<Entity, Relation | undefined>>;

  /**
   * Finds a single relation.
   * @param RelationClass - The class to serialize the relation into.
   * @param dto - The dto to find the relation for.
   * @param relationName - The name of the relation to query for.
   */
  async findRelation<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: Entity,
  ): Promise<Relation | undefined>;

  async findRelation<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: Entity | Entity[],
  ): Promise<(Relation | undefined) | Map<Entity, Relation | undefined>> {
    if (Array.isArray(dto)) {
      return this.batchFindRelations(RelationClass, relationName, dto);
    }
    const assembler = AssemblerFactory.getAssembler(RelationClass, this.getRelationEntity(relationName));
    const relationEntity = await this.createRelationQueryBuilder(dto, relationName).loadOne<Relation>();
    return relationEntity ? assembler.convertToDTO(relationEntity) : undefined;
  }

  /**
   * Add a single relation.
   * @param id - The id of the entity to add the relation to.
   * @param relationName - The name of the relation to query for.
   * @param relationIds - The ids of relations to add.
   */
  async addRelations<Relation>(
    relationName: string,
    id: string | number,
    relationIds: (string | number)[],
  ): Promise<Entity> {
    const entity = await this.repo.findOneOrFail(id);
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
  async setRelation<Relation>(relationName: string, id: string | number, relationId: string | number): Promise<Entity> {
    const entity = await this.repo.findOneOrFail(id);
    await this.createRelationQueryBuilder(entity, relationName).set(relationId);
    return entity;
  }

  /**
   * Removes multiple relations.
   * @param id - The id of the entity to add the relation to.
   * @param relationName - The name of the relation to query for.
   * @param relationIds - The ids of the relations to add.
   */
  async removeRelations<Relation>(
    relationName: string,
    id: string | number,
    relationIds: (string | number)[],
  ): Promise<Entity> {
    const entity = await this.repo.findOneOrFail(id);
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
    relationName: string,
    id: string | number,
    relationId: string | number,
  ): Promise<Entity> {
    const entity = await this.repo.findOneOrFail(id);
    const meta = this.getRelationMeta(relationName);
    if (meta.isOneToOne || meta.isManyToOne) {
      await this.createRelationQueryBuilder(entity, relationName).set(null);
    } else {
      await this.createRelationQueryBuilder(entity, relationName).remove(relationId);
    }

    return entity;
  }

  getRelationQueryBuilder<Relation>(name: string): RelationQueryBuilder<Entity, Relation> {
    return new RelationQueryBuilder(this.repo, name);
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
    const assembler = AssemblerFactory.getAssembler(RelationClass, this.getRelationEntity(relationName));
    const relationQueryBuilder = this.getRelationQueryBuilder(relationName);
    const convertedQuery = assembler.convertQuery(query);
    const entityRelations = await relationQueryBuilder.batchSelect(entities, convertedQuery).getRawAndEntities();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return entityRelations.raw.reduce((results: Map<Entity, Relation[]>, rawRelation: EntityIndexRelation<unknown>) => {
      // eslint-disable-next-line no-underscore-dangle
      const index: number = rawRelation.__nestjsQuery__entityIndex__;
      const e = entities[index];
      const relationDtos = assembler.convertToDTOs(
        this.getRelationsFromPrimaryKeys(relationQueryBuilder, rawRelation, entityRelations.entities),
      );
      return results.set(e, [...(results.get(e) ?? []), ...relationDtos]);
    }, new Map<Entity, Relation[]>());
  }

  /**
   * Query for an array of relations for multiple dtos.
   * @param RelationClass - The class to serialize the relations into.
   * @param entities - The entities to query relations for.
   * @param relationName - The name of relation to query for.
   * @param query - A query to filter, page or sort relations.
   */
  private async batchAggregateRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    entities: Entity[],
    filter: Filter<Relation>,
    aggregate: AggregateQuery<Relation>,
  ): Promise<Map<Entity, AggregateResponse<Relation>>> {
    const assembler = AssemblerFactory.getAssembler(RelationClass, this.getRelationEntity(relationName));
    const relationQueryBuilder = this.getRelationQueryBuilder<Relation>(relationName);
    const convertedQuery = assembler.convertQuery({ filter });
    const rawAggregates = await relationQueryBuilder
      .batchAggregate(entities, convertedQuery, aggregate)
      .getRawMany<EntityIndexRelation<Record<string, unknown>>>();
    return rawAggregates.reduce((results, relationAgg) => {
      // eslint-disable-next-line no-underscore-dangle
      const index = relationAgg.__nestjsQuery__entityIndex__;
      const e = entities[index];
      results.set(
        e,
        AggregateBuilder.convertToAggregateResponse(lodashOmit(relationAgg, relationQueryBuilder.entityIndexColName)),
      );
      return results;
    }, new Map<Entity, AggregateResponse<Relation>>());
  }

  /**
   * Count the number of relations for multiple dtos.
   * @param RelationClass - The class to serialize the relations into.
   * @param entities - The entities to query relations for.
   * @param relationName - The name of relation to query for.
   * @param filter - The filter to apply to the relation query.
   */
  private async batchCountRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    entities: Entity[],
    filter: Filter<Relation>,
  ): Promise<Map<Entity, number>> {
    const assembler = AssemblerFactory.getAssembler(RelationClass, this.getRelationEntity(relationName));
    const relationQueryBuilder = this.getRelationQueryBuilder(relationName);
    const convertedQuery = assembler.convertQuery({ filter });
    const entityRelations = await Promise.all(
      entities.map((e) => {
        return relationQueryBuilder.select(e, convertedQuery).getCount();
      }),
    );
    return entityRelations.reduce((results, relationCount, index) => {
      const e = entities[index];
      results.set(e, relationCount);
      return results;
    }, new Map<Entity, number>());
  }

  /**
   * Query for a relation for multiple dtos.
   * @param RelationClass - The class to serialize the relations into.
   * @param dtos - The dto to query relations for.
   * @param relationName - The name of relation to query for.
   * @param query - A query to filter, page or sort relations.
   */
  private async batchFindRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dtos: Entity[],
  ): Promise<Map<Entity, Relation | undefined>> {
    const batchResults = await this.batchQueryRelations(RelationClass, relationName, dtos, { paging: { limit: 1 } });
    const results = new Map<Entity, Relation>();
    batchResults.forEach((relation, dto) => {
      // get just the first one.
      results.set(dto, relation[0]);
    });
    return results;
  }

  private createRelationQueryBuilder(entity: Entity, relationName: string): TypeOrmRelationQueryBuilder<Entity> {
    return this.repo.createQueryBuilder().relation(relationName).of(entity);
  }

  private getRelationMeta(relationName: string): RelationMetadata {
    const relationMeta = this.repo.metadata.relations.find((r) => r.propertyName === relationName);
    if (!relationMeta) {
      throw new Error(`Unable to find relation ${relationName} on ${this.EntityClass.name}`);
    }
    return relationMeta;
  }

  private getRelationEntity(relationName: string): Class<unknown> {
    const relationMeta = this.getRelationMeta(relationName);
    if (typeof relationMeta.type === 'string') {
      return this.repo.manager.getRepository(relationMeta.type).target as Class<unknown>;
    }
    return relationMeta.type as Class<unknown>;
  }

  private getRelationsFromPrimaryKeys<Relation>(
    relationBuilder: RelationQueryBuilder<Entity, Relation>,
    rawResult: ObjectLiteral,
    relations: Relation[],
  ): Relation[] {
    const pks = relationBuilder.getRelationPrimaryKeysPropertyNameAndColumnsName();
    const filter = pks.reduce((keys, key) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      return { ...keys, [key.propertyName]: rawResult[key.columnName] };
    }, {} as Partial<Entity>);
    return lodashFilter(relations, filter) as Relation[];
  }
}
