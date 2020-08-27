import { Filter } from '@nestjs-query/core';

export interface CRUDAuthOptions<DTO> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filter: (context: any) => Filter<DTO> | Promise<Filter<DTO>>;
}

export interface CRUDAuthService<DTO> {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  authFilter(context: any): Promise<Filter<DTO>>;

  relationAuthFilter<Relation>(relationName: string, context: any): Promise<Filter<Relation>>;
}
