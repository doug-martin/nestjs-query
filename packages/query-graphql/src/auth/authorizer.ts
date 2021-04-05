import { Filter } from '@nestjs-query/core';

export interface AuthorizationContext {
  operationName: string;
}

export interface Authorizer<DTO> {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
  authorize(context: any, authorizerContext?: AuthorizationContext): Promise<Filter<DTO>>;

  authorizeRelation(
    relationName: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: any,
    authorizerContext?: AuthorizationContext,
  ): Promise<Filter<unknown>>;
}
