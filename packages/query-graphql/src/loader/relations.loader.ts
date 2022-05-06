import { QueryService } from '@ptc-org/nestjs-query-core';

export interface NestjsQueryDataloader<DTO, Args, Result> {
  createLoader(service: QueryService<DTO, unknown, unknown>): (args: ReadonlyArray<Args>) => Promise<Result[]>;
}
