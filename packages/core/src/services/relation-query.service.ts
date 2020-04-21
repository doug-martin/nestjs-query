import { Class } from '../common';
import { mergeQuery } from '../helpers';
import { Query } from '../interfaces';
import { NoOpQueryService } from './noop-query.service';
import { ProxyQueryService } from './proxy-query.service';
import { QueryService } from './query.service';

type RelationQueryServiceRelation<DTO, Relation> = {
  service: QueryService<Relation>;
  query: (dto: DTO) => Query<Relation>;
};

export class RelationQueryService<DTO> extends ProxyQueryService<DTO> {
  readonly relations: Record<string, RelationQueryServiceRelation<DTO, unknown>>;

  constructor(queryService: QueryService<DTO>, relations: Record<string, RelationQueryServiceRelation<DTO, unknown>>);

  constructor(relations: Record<string, RelationQueryServiceRelation<DTO, unknown>>);

  constructor(
    queryService: QueryService<DTO> | Record<string, RelationQueryServiceRelation<DTO, unknown>>,
    relations?: Record<string, RelationQueryServiceRelation<DTO, unknown>>,
  ) {
    if (typeof queryService.query === 'function') {
      super(queryService as QueryService<DTO>);
      this.relations = relations as Record<string, RelationQueryServiceRelation<DTO, unknown>>;
    } else {
      super(NoOpQueryService.getInstance());
      this.relations = queryService as Record<string, RelationQueryServiceRelation<DTO, unknown>>;
    }
  }

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
    const serviceRelation = this.getRelation<Relation>(relationName);
    if (!serviceRelation) {
      if (Array.isArray(dto)) {
        return super.queryRelations(RelationClass, relationName, dto, query);
      }
      return super.queryRelations(RelationClass, relationName, dto, query);
    }
    const { query: qf, service } = serviceRelation;
    if (Array.isArray(dto)) {
      return dto.reduce(async (mapPromise, d) => {
        const map = await mapPromise;
        const relations = await service.query(mergeQuery(query, qf(d)));
        return map.set(d, relations);
      }, Promise.resolve(new Map<DTO, Relation[]>()));
    }
    return service.query(mergeQuery(query, qf(dto)));
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
    const serviceRelation = this.getRelation<Relation>(relationName);
    if (!serviceRelation) {
      if (Array.isArray(dto)) {
        return super.findRelation(RelationClass, relationName, dto);
      }
      return super.findRelation(RelationClass, relationName, dto);
    }
    const { query: qf, service } = serviceRelation;
    if (Array.isArray(dto)) {
      return dto.reduce(async (mapPromise, d) => {
        const map = await mapPromise;
        const relation = await service.query(mergeQuery(qf(d), { paging: { limit: 1 } }));
        return map.set(d, relation[0]);
      }, Promise.resolve(new Map<DTO, Relation | undefined>()));
    }
    return (await service.query(mergeQuery(qf(dto), { paging: { limit: 1 } })))[0];
  }

  getRelation<Relation>(name: string): RelationQueryServiceRelation<DTO, Relation> | undefined {
    const relation = this.relations[name];
    if (relation) {
      return relation as RelationQueryServiceRelation<DTO, Relation>;
    }
    return undefined;
  }
}
