import { Query, Class, AssemblerFactory } from '@nestjs-query/core';
import { Model, ModelCtor } from 'sequelize-typescript';
import { FilterQueryBuilder } from '../query';

/**
 * Base class to house relations loading.
 * @internal
 */
export abstract class RelationQueryService<Entity extends Model> {
  abstract filterQueryBuilder: FilterQueryBuilder<Entity>;

  abstract model: ModelCtor<Entity>;

  abstract getById(id: string | number): Promise<Entity>;

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
    const relationQueryBuilder = this.getRelationQueryBuilder<Model>();
    const relations = await dto.$get(
      relationName as keyof Entity,
      relationQueryBuilder.findOptions(assembler.convertQuery(query)),
    );
    return assembler.convertToDTOs((relations as unknown) as Model[]);
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
    const relation = await dto.$get(relationName as keyof Entity);
    if (!relation) {
      return undefined;
    }
    return assembler.convertToDTO((relation as unknown) as Model);
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
    relationIds: string[] | number[],
  ): Promise<Entity> {
    const entity = await this.getById(id);
    await entity.$add(relationName, relationIds);
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
    const entity = await this.getById(id);
    await entity.$set(relationName as keyof Entity, relationId);
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
    relationIds: string[] | number[],
  ): Promise<Entity> {
    const entity = await this.getById(id);
    await entity.$remove(relationName, relationIds);
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
    const entity = await this.getById(id);
    await entity.$remove(relationName, relationId);
    return entity;
  }

  getRelationQueryBuilder<Relation>(): FilterQueryBuilder<Relation> {
    return new FilterQueryBuilder<Relation>();
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
    const relationQueryBuilder = this.getRelationQueryBuilder<Model>();
    const findOptions = relationQueryBuilder.findOptions(assembler.convertQuery(query));
    return entities.reduce(async (mapPromise, e) => {
      const map = await mapPromise;
      const relations = await e.$get(relationName as keyof Entity, findOptions);
      map.set(e, assembler.convertToDTOs((relations as unknown) as Model[]));
      return map;
    }, Promise.resolve(new Map<Entity, Relation[]>()));
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
    const assembler = AssemblerFactory.getAssembler(RelationClass, this.getRelationEntity(relationName));
    return dtos.reduce(async (mapPromise, e) => {
      const map = await mapPromise;
      const relation = await e.$get(relationName as keyof Entity);
      if (relation) {
        map.set(e, assembler.convertToDTO((relation as unknown) as Model));
      }
      return map;
    }, Promise.resolve(new Map<Entity, Relation | undefined>()));
  }

  private getRelationEntity(relationName: string): ModelCtor {
    const association = this.model.associations[relationName];
    if (!association) {
      throw new Error(`Unable to find relation ${relationName} on ${this.model.name}`);
    }
    return association.target as ModelCtor;
  }
}
