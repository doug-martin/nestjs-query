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

export class ProxyQueryService<DTO> implements QueryService<DTO> {
  constructor(readonly proxied: QueryService<DTO>) {}

  addRelations<Relation>(relationName: string, id: string | number, relationIds: (string | number)[]): Promise<DTO> {
    return this.proxied.addRelations(relationName, id, relationIds);
  }

  removeRelation<Relation>(relationName: string, id: string | number, relationId: string | number): Promise<DTO> {
    return this.proxied.removeRelation(relationName, id, relationId);
  }

  removeRelations<Relation>(relationName: string, id: string | number, relationIds: (string | number)[]): Promise<DTO> {
    return this.proxied.removeRelations(relationName, id, relationIds);
  }

  setRelation<Relation>(relationName: string, id: string | number, relationId: string | number): Promise<DTO> {
    return this.proxied.setRelation(relationName, id, relationId);
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
      return this.proxied.queryRelations(RelationClass, relationName, dto, query);
    }
    return this.proxied.queryRelations(RelationClass, relationName, dto, query);
  }

  countRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dtos: DTO[],
    filter: Filter<Relation>,
  ): Promise<Map<DTO, number>>;

  countRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: DTO,
    filter: Filter<Relation>,
  ): Promise<number>;

  async countRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: DTO | DTO[],
    filter: Filter<Relation>,
  ): Promise<number | Map<DTO, number>> {
    if (Array.isArray(dto)) {
      return this.proxied.countRelations(RelationClass, relationName, dto, filter);
    }
    return this.proxied.countRelations(RelationClass, relationName, dto, filter);
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
      return this.proxied.findRelation(RelationClass, relationName, dto);
    }
    return this.proxied.findRelation(RelationClass, relationName, dto);
  }

  createMany<C extends DeepPartial<DTO>>(items: C[]): Promise<DTO[]> {
    return this.proxied.createMany(items);
  }

  createOne<C extends DeepPartial<DTO>>(item: C): Promise<DTO> {
    return this.proxied.createOne(item);
  }

  async deleteMany(filter: Filter<DTO>): Promise<DeleteManyResponse> {
    return this.proxied.deleteMany(filter);
  }

  deleteOne(id: number | string): Promise<DTO> {
    return this.proxied.deleteOne(id);
  }

  async findById(id: string | number): Promise<DTO | undefined> {
    return this.proxied.findById(id);
  }

  getById(id: string | number): Promise<DTO> {
    return this.proxied.getById(id);
  }

  query(query: Query<DTO>): Promise<DTO[]> {
    return this.proxied.query(query);
  }

  aggregate(filter: Filter<DTO>, query: AggregateQuery<DTO>): Promise<AggregateResponse<DTO>> {
    return this.proxied.aggregate(filter, query);
  }

  count(filter: Filter<DTO>): Promise<number> {
    return this.proxied.count(filter);
  }

  updateMany<U extends DeepPartial<DTO>>(update: U, filter: Filter<DTO>): Promise<UpdateManyResponse> {
    return this.proxied.updateMany(update, filter);
  }

  updateOne<U extends DeepPartial<DTO>>(id: string | number, update: U): Promise<DTO> {
    return this.proxied.updateOne(id, update);
  }
}
