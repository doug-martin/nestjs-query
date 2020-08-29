import { Filter } from '@nestjs-query/core';

export interface Authorizer<DTO> {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  authorize(context: any): Promise<Filter<DTO>>;

  authorizeRelation(relationName: string, context: any): Promise<Filter<unknown>>;
}
