import { Assembler } from '../assemblers';
import { Class, DeepPartial } from '../common';
import {
  AggregateQuery,
  AggregateResponse,
  DeleteManyResponse,
  Filter,
  Query,
  UpdateManyResponse,
} from '../interfaces';
import { QueryService } from './query.service';

export class AssemblerQueryService<DTO, Entity> implements QueryService<DTO> {
  constructor(readonly assembler: Assembler<DTO, Entity>, readonly queryService: QueryService<Entity>) {}

  addRelations<Relation>(relationName: string, id: string | number, relationIds: (string | number)[]): Promise<DTO> {
    return this.assembler.convertAsyncToDTO(this.queryService.addRelations(relationName, id, relationIds));
  }

  createMany<C extends DeepPartial<DTO>>(items: C[]): Promise<DTO[]> {
    const { assembler } = this;
    const converted = items.map((c) => assembler.convertToEntity((c as unknown) as DTO));
    return this.assembler.convertAsyncToDTOs(this.queryService.createMany(converted));
  }

  createOne<C extends DeepPartial<DTO>>(item: C): Promise<DTO> {
    const c = this.assembler.convertToEntity((item as unknown) as DTO);
    return this.assembler.convertAsyncToDTO(this.queryService.createOne(c));
  }

  async deleteMany(filter: Filter<DTO>): Promise<DeleteManyResponse> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.queryService.deleteMany(this.assembler.convertQuery({ filter }).filter!);
  }

  deleteOne(id: number | string): Promise<DTO> {
    return this.assembler.convertAsyncToDTO(this.queryService.deleteOne(id));
  }

  async findById(id: string | number): Promise<DTO | undefined> {
    const entity = await this.queryService.findById(id);
    if (!entity) {
      return undefined;
    }
    return this.assembler.convertToDTO(entity);
  }

  getById(id: string | number): Promise<DTO> {
    return this.assembler.convertAsyncToDTO(this.queryService.getById(id));
  }

  query(query: Query<DTO>): Promise<DTO[]> {
    return this.assembler.convertAsyncToDTOs(this.queryService.query(this.assembler.convertQuery(query)));
  }

  async aggregate(filter: Filter<DTO>, aggregate: AggregateQuery<DTO>): Promise<AggregateResponse<DTO>> {
    const aggregateResponse = await this.queryService.aggregate(
      this.assembler.convertQuery({ filter }).filter || {},
      this.assembler.convertAggregateQuery(aggregate),
    );
    return this.assembler.convertAggregateResponse(aggregateResponse);
  }

  count(filter: Filter<DTO>): Promise<number> {
    return this.queryService.count(this.assembler.convertQuery({ filter }).filter || {});
  }

  /**
   * Query for relations for an array of DTOs. This method will return a map with the DTO as the key and the relations as the value.
   * @param RelationClass - The class of the relation.
   * @param relationName - The name of the relation to load.
   * @param dtos - the dtos to find relations for.
   * @param query - A query to use to filter, page, and sort relations.
   */
  queryRelations<Relation>(
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
  queryRelations<Relation>(
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
      const entities = this.assembler.convertToEntities(dto);
      const relationMap = await this.queryService.queryRelations(RelationClass, relationName, entities, query);
      return entities.reduce((map, e, index) => {
        const entry = relationMap.get(e) ?? [];
        map.set(dto[index], entry);
        return map;
      }, new Map<DTO, Relation[]>());
    }
    return this.queryService.queryRelations(RelationClass, relationName, this.assembler.convertToEntity(dto), query);
  }

  countRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: DTO,
    filter: Filter<Relation>,
  ): Promise<number>;

  countRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: DTO[],
    filter: Filter<Relation>,
  ): Promise<Map<DTO, number>>;

  async countRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: DTO | DTO[],
    filter: Filter<Relation>,
  ): Promise<number | Map<DTO, number>> {
    if (Array.isArray(dto)) {
      const entities = this.assembler.convertToEntities(dto);
      const relationMap = await this.queryService.countRelations(RelationClass, relationName, entities, filter);
      return entities.reduce((map, e, index) => {
        const entry = relationMap.get(e) ?? 0;
        map.set(dto[index], entry);
        return map;
      }, new Map<DTO, number>());
    }
    return this.queryService.countRelations(RelationClass, relationName, this.assembler.convertToEntity(dto), filter);
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
      const entities = this.assembler.convertToEntities(dto);
      const relationMap = await this.queryService.findRelation(RelationClass, relationName, entities);
      return entities.reduce((map, e, index) => {
        map.set(dto[index], relationMap.get(e));
        return map;
      }, new Map<DTO, Relation | undefined>());
    }
    return this.queryService.findRelation(RelationClass, relationName, this.assembler.convertToEntity(dto));
  }

  removeRelation<Relation>(relationName: string, id: string | number, relationId: string | number): Promise<DTO> {
    return this.assembler.convertAsyncToDTO(this.queryService.removeRelation(relationName, id, relationId));
  }

  removeRelations<Relation>(relationName: string, id: string | number, relationIds: (string | number)[]): Promise<DTO> {
    return this.assembler.convertAsyncToDTO(this.queryService.removeRelations(relationName, id, relationIds));
  }

  setRelation<Relation>(relationName: string, id: string | number, relationId: string | number): Promise<DTO> {
    return this.assembler.convertAsyncToDTO(this.queryService.setRelation(relationName, id, relationId));
  }

  updateMany<U extends DeepPartial<DTO>>(update: U, filter: Filter<DTO>): Promise<UpdateManyResponse> {
    return this.queryService.updateMany(
      this.assembler.convertToEntity((update as unknown) as DTO),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.assembler.convertQuery({ filter }).filter!,
    );
  }

  updateOne<U extends DeepPartial<DTO>>(id: string | number, update: U): Promise<DTO> {
    return this.assembler.convertAsyncToDTO(
      this.queryService.updateOne(id, this.assembler.convertToEntity((update as unknown) as DTO)),
    );
  }
}
