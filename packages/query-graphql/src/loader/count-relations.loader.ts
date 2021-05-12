import { Class, Filter, QueryService } from '@nestjs-query/core';
import { NestjsQueryDataloader } from './relations.loader';

type CountRelationsArgs<DTO, Relation> = { dto: DTO; filter: Filter<Relation> };
type CountRelationsMap<DTO, Relation> = Map<string, (CountRelationsArgs<DTO, Relation> & { index: number })[]>;

export class CountRelationsLoader<DTO, Relation>
  implements NestjsQueryDataloader<DTO, CountRelationsArgs<DTO, Relation>, number | Error>
{
  constructor(readonly RelationDTO: Class<Relation>, readonly relationName: string) {}

  createLoader(service: QueryService<DTO, unknown, unknown>) {
    return async (queryArgs: ReadonlyArray<CountRelationsArgs<DTO, Relation>>): Promise<(number | Error)[]> => {
      // group
      const queryMap = this.groupQueries(queryArgs);
      return this.loadResults(service, queryMap);
    };
  }

  private async loadResults(
    service: QueryService<DTO, unknown, unknown>,
    countRelationsMap: CountRelationsMap<DTO, Relation>,
  ): Promise<number[]> {
    const results: number[] = [];
    await Promise.all(
      [...countRelationsMap.values()].map(async (args) => {
        const { filter } = args[0];
        const dtos = args.map((a) => a.dto);
        const relationCountResults = await service.countRelations(this.RelationDTO, this.relationName, dtos, filter);
        const dtoRelations = dtos.map((dto) => relationCountResults.get(dto) ?? 0);
        dtoRelations.forEach((relationCount, index) => {
          results[args[index].index] = relationCount;
        });
      }),
    );
    return results;
  }

  private groupQueries(countArgs: ReadonlyArray<CountRelationsArgs<DTO, Relation>>): CountRelationsMap<DTO, Relation> {
    // group
    return countArgs.reduce((map, args, index) => {
      const filterJson = JSON.stringify(args.filter);
      if (!map.has(filterJson)) {
        map.set(filterJson, []);
      }
      map.get(filterJson)?.push({ ...args, index });
      return map;
    }, new Map<string, (CountRelationsArgs<DTO, Relation> & { index: number })[]>());
  }
}
