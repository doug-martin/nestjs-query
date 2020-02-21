import { QueryService } from '@nestjs-query/core';

export interface NestjsQueryDataloader<DTO, Args, Result> {
  createLoader(service: QueryService<DTO>): (args: ReadonlyArray<Args>) => Promise<Result[]>;
}
