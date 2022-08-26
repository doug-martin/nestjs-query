import { Assembler } from '../assemblers'
import { Class, DeepPartial } from '../common'
import {
  AggregateQuery,
  AggregateResponse,
  DeleteManyResponse,
  DeleteOneOptions,
  Filter,
  Filterable,
  FindByIdOptions,
  FindRelationOptions,
  GetByIdOptions,
  ModifyRelationOptions,
  Query,
  UpdateManyResponse,
  UpdateOneOptions
} from '../interfaces'
import { QueryService } from './query.service'

export class AssemblerQueryService<DTO, Entity, C = DeepPartial<DTO>, CE = DeepPartial<Entity>, U = C, UE = CE>
  implements QueryService<DTO, C, U>
{
  constructor(readonly assembler: Assembler<DTO, Entity, C, CE, U, UE>, readonly queryService: QueryService<Entity, CE, UE>) {}

  addRelations<Relation>(
    relationName: string,
    id: string | number,
    relationIds: (string | number)[],
    opts?: ModifyRelationOptions<DTO, Relation>
  ): Promise<DTO> {
    return this.assembler.convertAsyncToDTO(
      this.queryService.addRelations(relationName, id, relationIds, this.convertModifyRelationsOptions(opts))
    )
  }

  createMany(items: C[]): Promise<DTO[]> {
    const { assembler } = this
    const converted = assembler.convertToCreateEntities(items)
    return this.assembler.convertAsyncToDTOs(this.queryService.createMany(converted))
  }

  createOne(item: C): Promise<DTO> {
    const c = this.assembler.convertToCreateEntity(item)
    return this.assembler.convertAsyncToDTO(this.queryService.createOne(c))
  }

  async deleteMany(filter: Filter<DTO>): Promise<DeleteManyResponse> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.queryService.deleteMany(this.assembler.convertQuery({ filter }).filter)
  }

  deleteOne(id: number | string, opts?: DeleteOneOptions<DTO>): Promise<DTO> {
    return this.assembler.convertAsyncToDTO(this.queryService.deleteOne(id, this.convertFilterable(opts)))
  }

  async findById(id: string | number, opts?: FindByIdOptions<DTO>): Promise<DTO | undefined> {
    const entity = await this.queryService.findById(id, this.convertFilterable(opts))
    if (!entity) {
      return undefined
    }
    return this.assembler.convertToDTO(entity)
  }

  getById(id: string | number, opts?: GetByIdOptions<DTO>): Promise<DTO> {
    return this.assembler.convertAsyncToDTO(this.queryService.getById(id, this.convertFilterable(opts)))
  }

  query(query: Query<DTO>): Promise<DTO[]> {
    return this.assembler.convertAsyncToDTOs(this.queryService.query(this.assembler.convertQuery(query)))
  }

  async aggregate(filter: Filter<DTO>, aggregate: AggregateQuery<DTO>): Promise<AggregateResponse<DTO>[]> {
    const aggregateResponse = await this.queryService.aggregate(
      this.assembler.convertQuery({ filter }).filter || {},
      this.assembler.convertAggregateQuery(aggregate)
    )
    return aggregateResponse.map((agg) => this.assembler.convertAggregateResponse(agg))
  }

  count(filter: Filter<DTO>): Promise<number> {
    return this.queryService.count(this.assembler.convertQuery({ filter }).filter || {})
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
    query: Query<Relation>
  ): Promise<Map<DTO, Relation[]>>

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
    query: Query<Relation>
  ): Promise<Relation[]>

  async queryRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: DTO | DTO[],
    query: Query<Relation>
  ): Promise<Relation[] | Map<DTO, Relation[]>> {
    if (Array.isArray(dto)) {
      const entities = this.assembler.convertToEntities(dto)
      const relationMap = await this.queryService.queryRelations(RelationClass, relationName, entities, query)

      return entities.reduce((map, e, index) => {
        const entry = relationMap.get(e) ?? []

        map.set(dto[index], entry)

        return map
      }, new Map<DTO, Relation[]>())
    }

    return this.queryService.queryRelations(RelationClass, relationName, this.assembler.convertToEntity(dto), query)
  }

  countRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: DTO,
    filter: Filter<Relation>
  ): Promise<number>

  countRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: DTO[],
    filter: Filter<Relation>
  ): Promise<Map<DTO, number>>

  async countRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: DTO | DTO[],
    filter: Filter<Relation>
  ): Promise<number | Map<DTO, number>> {
    if (Array.isArray(dto)) {
      const entities = this.assembler.convertToEntities(dto)
      const relationMap = await this.queryService.countRelations(RelationClass, relationName, entities, filter)
      return entities.reduce((map, e, index) => {
        const entry = relationMap.get(e) ?? 0
        map.set(dto[index], entry)
        return map
      }, new Map<DTO, number>())
    }
    return this.queryService.countRelations(RelationClass, relationName, this.assembler.convertToEntity(dto), filter)
  }

  /**
   * Find a relation for an array of DTOs. This will return a Map where the key is the DTO and the value is to relation or undefined if not found.
   * @param RelationClass - the class of the relation
   * @param relationName - the name of the relation to load.
   * @param dtos - the dtos to find the relation for.
   * @param filter - Additional filter to apply when finding relations
   */
  async findRelation<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dtos: DTO[],
    opts?: FindRelationOptions<Relation>
  ): Promise<Map<DTO, Relation | undefined>>

  /**
   * Finds a single relation.
   * @param RelationClass - The class to serialize the relation into.
   * @param dto - The dto to find the relation for.
   * @param relationName - The name of the relation to query for.
   * @param filter - Additional filter to apply when finding relations
   */
  async findRelation<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: DTO,
    opts?: FindRelationOptions<Relation>
  ): Promise<Relation | undefined>

  async findRelation<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: DTO | DTO[],
    opts?: FindRelationOptions<Relation>
  ): Promise<(Relation | undefined) | Map<DTO, Relation | undefined>> {
    if (Array.isArray(dto)) {
      const entities = this.assembler.convertToEntities(dto)
      const relationMap = await this.queryService.findRelation(RelationClass, relationName, entities, opts)
      return entities.reduce((map, e, index) => {
        map.set(dto[index], relationMap.get(e))
        return map
      }, new Map<DTO, Relation | undefined>())
    }
    return this.queryService.findRelation(RelationClass, relationName, this.assembler.convertToEntity(dto))
  }

  removeRelation<Relation>(
    relationName: string,
    id: string | number,
    relationId: string | number,
    opts?: ModifyRelationOptions<DTO, Relation>
  ): Promise<DTO> {
    return this.assembler.convertAsyncToDTO(
      this.queryService.removeRelation(relationName, id, relationId, this.convertModifyRelationsOptions(opts))
    )
  }

  removeRelations<Relation>(
    relationName: string,
    id: string | number,
    relationIds: (string | number)[],
    opts?: ModifyRelationOptions<DTO, Relation>
  ): Promise<DTO> {
    return this.assembler.convertAsyncToDTO(
      this.queryService.removeRelations(relationName, id, relationIds, this.convertModifyRelationsOptions(opts))
    )
  }

  setRelations<Relation>(
    relationName: string,
    id: string | number,
    relationIds: (string | number)[],
    opts?: ModifyRelationOptions<DTO, Relation>
  ): Promise<DTO> {
    return this.assembler.convertAsyncToDTO(
      this.queryService.setRelations(relationName, id, relationIds, this.convertModifyRelationsOptions(opts))
    )
  }

  setRelation<Relation>(
    relationName: string,
    id: string | number,
    relationId: string | number,
    opts?: ModifyRelationOptions<DTO, Relation>
  ): Promise<DTO> {
    return this.assembler.convertAsyncToDTO(
      this.queryService.setRelation(relationName, id, relationId, this.convertModifyRelationsOptions(opts))
    )
  }

  updateMany(update: U, filter: Filter<DTO>): Promise<UpdateManyResponse> {
    return this.queryService.updateMany(
      this.assembler.convertToUpdateEntity(update),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.assembler.convertQuery({ filter }).filter
    )
  }

  updateOne(id: string | number, update: U, opts?: UpdateOneOptions<DTO>): Promise<DTO> {
    return this.assembler.convertAsyncToDTO(
      this.queryService.updateOne(id, this.assembler.convertToUpdateEntity(update), this.convertFilterable(opts))
    )
  }

  aggregateRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: DTO,
    filter: Filter<Relation>,
    aggregate: AggregateQuery<Relation>
  ): Promise<AggregateResponse<Relation>[]>
  aggregateRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dtos: DTO[],
    filter: Filter<Relation>,
    aggregate: AggregateQuery<Relation>
  ): Promise<Map<DTO, AggregateResponse<Relation>[]>>
  async aggregateRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: DTO | DTO[],
    filter: Filter<Relation>,
    aggregate: AggregateQuery<Relation>
  ): Promise<AggregateResponse<Relation>[] | Map<DTO, AggregateResponse<Relation>[]>> {
    if (Array.isArray(dto)) {
      const entities = this.assembler.convertToEntities(dto)
      const relationMap = await this.queryService.aggregateRelations(RelationClass, relationName, entities, filter, aggregate)
      return entities.reduce((map, e, index) => {
        const entry = relationMap.get(e) ?? []
        map.set(dto[index], entry)
        return map
      }, new Map<DTO, AggregateResponse<Relation>[]>())
    }
    return this.queryService.aggregateRelations(
      RelationClass,
      relationName,
      this.assembler.convertToEntity(dto),
      filter,
      aggregate
    )
  }

  private convertFilterable(filterable?: Filterable<DTO>): Filterable<Entity> | undefined {
    if (!filterable) {
      return undefined
    }

    return { ...filterable, filter: this.assembler.convertQuery({ filter: filterable?.filter }).filter }
  }

  private convertModifyRelationsOptions<Relation>(
    modifyRelationOptions?: ModifyRelationOptions<DTO, Relation>
  ): ModifyRelationOptions<Entity, Relation> | undefined {
    if (!modifyRelationOptions) {
      return undefined
    }
    return {
      filter: this.assembler.convertQuery({ filter: modifyRelationOptions?.filter }).filter,
      relationFilter: modifyRelationOptions.relationFilter
    }
  }
}
