import { Class, FindRelationOptions, QueryService } from '@ptc-org/nestjs-query-core'

import { NestjsQueryDataloader } from './relations.loader'

export type FindRelationsArgs<DTO, Relation> = { dto: DTO } & FindRelationOptions<Relation>
type FindRelationsOpts<Relation> = Omit<FindRelationOptions<Relation>, 'filter'>
type FindRelationsMap<DTO, Relation> = Map<string, (FindRelationsArgs<DTO, Relation> & { index: number })[]>

export class FindRelationsLoader<DTO, Relation>
  implements NestjsQueryDataloader<DTO, FindRelationsArgs<DTO, Relation>, Relation | undefined | Error>
{
  constructor(readonly RelationDTO: Class<Relation>, readonly relationName: string) {}

  public createLoader(service: QueryService<DTO, unknown, unknown>, opts?: FindRelationsOpts<Relation>) {
    return async (args: ReadonlyArray<FindRelationsArgs<DTO, Relation>>): Promise<(Relation | undefined | Error)[]> => {
      const grouped = this.groupFinds(args, opts)
      return this.loadResults(service, grouped)
    }
  }

  private async loadResults(
    service: QueryService<DTO, unknown, unknown>,
    findRelationsMap: FindRelationsMap<DTO, Relation>
  ): Promise<(Relation | undefined)[]> {
    const results: (Relation | undefined)[] = []
    await Promise.all(
      [...findRelationsMap.values()].map(async (args) => {
        const { filter, withDeleted } = args[0]
        const dtos = args.map((a) => a.dto)
        const opts = { filter, withDeleted }
        const relationResults = await service.findRelation(this.RelationDTO, this.relationName, dtos, opts)
        const dtoRelations: (Relation | undefined)[] = dtos.map((dto) => relationResults.get(dto))
        dtoRelations.forEach((relation, index) => {
          results[args[index].index] = relation
        })
      })
    )
    return results
  }

  private groupFinds(
    queryArgs: ReadonlyArray<FindRelationsArgs<DTO, Relation>>,
    opts?: FindRelationsOpts<Relation>
  ): FindRelationsMap<DTO, Relation> {
    // group
    return queryArgs.reduce((map, args, index) => {
      const filterJson = JSON.stringify(args.filter)
      if (!map.has(filterJson)) {
        map.set(filterJson, [])
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      map.get(filterJson)!.push({ ...args, ...opts, index })
      return map
    }, new Map<string, (FindRelationsArgs<DTO, Relation> & { index: number })[]>())
  }
}
