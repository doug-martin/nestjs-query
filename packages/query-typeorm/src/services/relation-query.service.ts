import { AssemblerService, Query, Class, Assembler } from '@nestjs-query/core';
import { Repository, RelationQueryBuilder as TypeOrmRelationQueryBuilder, ObjectLiteral } from 'typeorm';
import lodashFilter from 'lodash.filter';
import { FilterQueryBuilder, RelationQueryBuilder } from '../query';

/**
 * Base class to house relations loading.
 * @internal
 */
export abstract class RelationQueryService<DTO, Entity = DTO> {
  abstract assemblerService: AssemblerService;

  abstract DTOClass: Class<DTO>;

  abstract filterQueryBuilder: FilterQueryBuilder<Entity>;

  abstract EntityClass: Class<Entity>;

  abstract assembler: Assembler<DTO, Entity>;

  abstract repo: Repository<Entity>;

  /**
   * Query for relations for an array of DTOs. This method will return a map with the DTO as the key and the relations as the value.
   * @param RelationClass - The class of the relation.
   * @param relationName - The name of the relation to load.
   * @param dtos - the dtos to find relations for.
   * @param query - A query to use to filter, page, and sort relations.
   */
  async queryRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dtos: DTO[],
    query: Query<Relation>,
  ): Promise<Map<DTO, Relation[]>>;

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
    dto: DTO,
    query: Query<Relation>,
  ): Promise<Relation[]>;

  async queryRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: DTO | DTO[],
    query: Query<Relation>,
  ): Promise<Relation[] | Map<DTO, Relation[]>> {
    if (Array.isArray(dto)) {
      return this.batchQueryRelations(RelationClass, relationName, dto, query);
    }
    const assembler = this.assemblerService.getAssembler(RelationClass, this.getRelationEntity(relationName));
    const relationQueryBuilder = this.getRelationQueryBuilder(relationName);
    return assembler.convertAsyncToDTOs(
      relationQueryBuilder.select(this.assembler.convertToEntity(dto), assembler.convertQuery(query)).getMany(),
    );
  }

  /**
   * Find a relation for an array of DTOs. This will return a Map where the key is the DTO and the value is to relation or undefined if not found.
   * @param RelationClass - the class of the relation
   * @param relationName - the name of the relation to load.
   * @param dtos - the dtos to find the relation for.
   */
  async findRelation<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dtos: DTO[],
  ): Promise<Map<DTO, Relation | undefined>>;

  /**
   * Finds a single relation.
   * @param RelationClass - The class to serialize the relation into.
   * @param dto - The dto to find the relation for.
   * @param relationName - The name of the relation to query for.
   */
  async findRelation<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: DTO,
  ): Promise<Relation | undefined>;

  async findRelation<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: DTO | DTO[],
  ): Promise<(Relation | undefined) | Map<DTO, Relation | undefined>> {
    if (Array.isArray(dto)) {
      return this.batchFindRelations(RelationClass, relationName, dto);
    }
    const assembler = this.assemblerService.getAssembler(RelationClass, this.getRelationEntity(relationName));
    const relationEntity = await this.createRelationQueryBuilder(
      this.assembler.convertToEntity(dto),
      relationName,
    ).loadOne<Relation>();
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
  ): Promise<DTO> {
    const entity = await this.repo.findOneOrFail(id);
    await this.createRelationQueryBuilder(entity, relationName).add(relationIds);
    return this.assembler.convertToDTO(entity);
  }

  /**
   * Set the relation on the entity.
   *
   * @param id - The id of the entity to set the relation on.
   * @param relationName - The name of the relation to query for.
   * @param relationId - The id of the relation to set on the entity.
   */
  async setRelation<Relation>(relationName: string, id: string | number, relationId: string | number): Promise<DTO> {
    const entity = await this.repo.findOneOrFail(id);
    await this.createRelationQueryBuilder(entity, relationName).set(relationId);
    return this.assembler.convertToDTO(entity);
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
  ): Promise<DTO> {
    const entity = await this.repo.findOneOrFail(id);
    await this.createRelationQueryBuilder(entity, relationName).remove(relationIds);
    return this.assembler.convertToDTO(entity);
  }

  /**
   * Remove the relation on the entity.
   *
   * @param id - The id of the entity to set the relation on.
   * @param relationName - The name of the relation to query for.
   * @param relationId - The id of the relation to set on the entity.
   */
  async removeRelation<Relation>(relationName: string, id: string | number, relationId: string | number): Promise<DTO> {
    const entity = await this.repo.findOneOrFail(id);
    await this.createRelationQueryBuilder(entity, relationName).remove(relationId);
    return this.assembler.convertToDTO(entity);
  }

  getRelationQueryBuilder<Relation>(name: string): RelationQueryBuilder<Entity, Relation> {
    return new RelationQueryBuilder(this.repo, name);
  }

  /**
   * Query for an array of relations for multiple dtos.
   * @param RelationClass - The class to serialize the relations into.
   * @param dto - The dto to query relations for.
   * @param relationName - The name of relation to query for.
   * @param query - A query to filter, page or sort relations.
   */
  private async batchQueryRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dtos: DTO[],
    query: Query<Relation>,
  ): Promise<Map<DTO, Relation[]>> {
    const assembler = this.assemblerService.getAssembler(RelationClass, this.getRelationEntity(relationName));
    const entities = this.assembler.convertToEntities(dtos);
    const relationQueryBuilder = this.getRelationQueryBuilder(relationName);
    const relations = await relationQueryBuilder.select(entities, assembler.convertQuery(query)).getRawAndEntities();
    return relations.raw.reduce((results, rawRelation) => {
      this.getEntityFromFromResult(rawRelation, entities).forEach(e => {
        const dto = dtos[entities.indexOf(e)];
        if (!results.has(dto)) {
          results.set(dto, []);
        }
        const relationDtos = assembler.convertToDTOs(
          this.getRelationsFromPrimaryKeys(relationQueryBuilder, rawRelation, relations.entities),
        );
        results.get(dto).push(...relationDtos);
      });
      return results;
    }, new Map<DTO, Relation[]>());
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
    dtos: DTO[],
  ): Promise<Map<DTO, Relation | undefined>> {
    const batchResults = await this.batchQueryRelations(RelationClass, relationName, dtos, { paging: { limit: 1 } });
    const results = new Map<DTO, Relation>();
    batchResults.forEach((relation, dto) => {
      // get just the first one.
      results.set(dto, relation[0]);
    });
    return results;
  }

  private createRelationQueryBuilder(entity: Entity, relationName: string): TypeOrmRelationQueryBuilder<Entity> {
    return this.repo
      .createQueryBuilder()
      .relation(relationName)
      .of(entity);
  }

  private getRelationEntity(relationName: string): Class<unknown> {
    const relationMeta = this.repo.metadata.relations.find(r => r.propertyName === relationName);
    if (!relationMeta) {
      throw new Error(`Unable to find relation ${relationName} on ${this.EntityClass.name}`);
    }
    return relationMeta.type as Class<unknown>;
  }

  private getEntityFromFromResult(rawResult: ObjectLiteral, entities: Entity[]): Entity[] {
    const pks = Object.keys(rawResult)
      .filter(key => RelationQueryBuilder.isEntityIdCol(key))
      .reduce((keys, key) => {
        const entityProp = RelationQueryBuilder.parseEntityIdFromName(key);
        return { ...keys, [entityProp]: rawResult[key] };
      }, {} as Partial<Entity>);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return lodashFilter(entities as any[], pks);
  }

  private getRelationsFromPrimaryKeys<Relation>(
    relationBuilder: RelationQueryBuilder<Entity, Relation>,
    rawResult: ObjectLiteral,
    relations: Relation[],
  ): Relation[] {
    const pks = relationBuilder.getRelationPrimaryKeysPropertyNameAndColumnsName();
    const filter = pks.reduce((keys, key) => {
      return { ...keys, [key.propertyName]: rawResult[key.columnName] };
    }, {} as Partial<Entity>);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return lodashFilter(relations as any[], filter);
  }
}
