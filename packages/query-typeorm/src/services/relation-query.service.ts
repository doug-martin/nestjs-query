import { Query, Class, AssemblerFactory } from '@nestjs-query/core';
import { Repository, RelationQueryBuilder as TypeOrmRelationQueryBuilder } from 'typeorm';
import { FilterQueryBuilder, RelationQueryBuilder } from '../query';

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
    await this.createRelationQueryBuilder(entity, relationName).remove(relationId);
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
    const entityRelations = await Promise.all(
      entities.map((e) => {
        return relationQueryBuilder.select(e, convertedQuery).getMany();
      }),
    );
    return entityRelations.reduce((results, relations, index) => {
      const e = entities[index];
      results.set(e, assembler.convertToDTOs(relations));
      return results;
    }, new Map<Entity, Relation[]>());
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

  private getRelationEntity(relationName: string): Class<unknown> {
    const relationMeta = this.repo.metadata.relations.find((r) => r.propertyName === relationName);
    if (!relationMeta) {
      throw new Error(`Unable to find relation ${relationName} on ${this.EntityClass.name}`);
    }
    if (typeof relationMeta.type === 'string') {
      return this.repo.manager.getRepository(relationMeta.type).target as Class<unknown>;
    }
    return relationMeta.type as Class<unknown>;
  }
}
