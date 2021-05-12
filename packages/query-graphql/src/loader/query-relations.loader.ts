import { Class, Query, QueryService } from '@nestjs-query/core';
import { NestjsQueryDataloader } from './relations.loader';

type QueryRelationsArgs<DTO, Relation> = { dto: DTO; query: Query<Relation> };
type QueryRelationsMap<DTO, Relation> = Map<string, (QueryRelationsArgs<DTO, Relation> & { index: number })[]>;

export class QueryRelationsLoader<DTO, Relation>
  implements NestjsQueryDataloader<DTO, QueryRelationsArgs<DTO, Relation>, Relation[] | Error>
{
  constructor(readonly RelationDTO: Class<Relation>, readonly relationName: string) {}

  createLoader(service: QueryService<DTO, unknown, unknown>) {
    return async (queryArgs: ReadonlyArray<QueryRelationsArgs<DTO, Relation>>): Promise<(Relation[] | Error)[]> => {
      // group
      const queryMap = this.groupQueries(queryArgs);
      return this.loadResults(service, queryMap);
    };
  }

  private async loadResults(
    service: QueryService<DTO, unknown, unknown>,
    queryRelationsMap: QueryRelationsMap<DTO, Relation>,
  ): Promise<Relation[][]> {
    const results: Relation[][] = [];
    await Promise.all(
      [...queryRelationsMap.values()].map(async (args) => {
        const { query } = args[0];
        const dtos = args.map((a) => a.dto);
        const relationResults = await service.queryRelations(this.RelationDTO, this.relationName, dtos, query);
        const dtoRelations = dtos.map((dto) => relationResults.get(dto) ?? []);
        dtoRelations.forEach((relations, index) => {
          results[args[index].index] = relations;
        });
      }),
    );
    return results;
  }

  private groupQueries(queryArgs: ReadonlyArray<QueryRelationsArgs<DTO, Relation>>): QueryRelationsMap<DTO, Relation> {
    // group
    return queryArgs.reduce((map, args, index) => {
      const queryJson = JSON.stringify(args.query);
      if (!map.has(queryJson)) {
        map.set(queryJson, []);
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      map.get(queryJson)!.push({ ...args, index });
      return map;
    }, new Map<string, (QueryRelationsArgs<DTO, Relation> & { index: number })[]>());
  }
}
