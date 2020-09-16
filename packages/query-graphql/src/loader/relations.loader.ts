import { QueryService } from '@nestjs-query/core';

export interface NestjsQueryDataloader<DTO, Args, Result> {
  createLoader(service: QueryService<DTO, unknown, unknown>): (args: ReadonlyArray<Args>) => Promise<Result[]>;
}
