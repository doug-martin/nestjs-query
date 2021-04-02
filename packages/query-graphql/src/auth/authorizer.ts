import { Filter } from '@nestjs-query/core';

export interface Authorizer<DTO> {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
  authorize(context: any, operationName?: string): Promise<Filter<DTO>>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  authorizeRelation(relationName: string, context: any, operationName?: string): Promise<Filter<unknown>>;
}
