import { Class, QueryService } from '@nestjs-query/core';
import { NestjsQueryDataloader } from './relations.loader';

export class FindRelationsLoader<DTO, Relation>
  implements NestjsQueryDataloader<DTO, DTO, Relation | undefined | Error> {
  constructor(readonly RelationDTO: Class<Relation>, readonly relationName: string) {}

  createLoader(service: QueryService<DTO>) {
    return async (args: ReadonlyArray<DTO>): Promise<(Relation | undefined | Error)[]> => {
      const dtos = args.map(a => a);
      const results = await service.findRelation(this.RelationDTO, this.relationName, dtos);
      return dtos.map(dto => results.get(dto));
    };
  }
}
