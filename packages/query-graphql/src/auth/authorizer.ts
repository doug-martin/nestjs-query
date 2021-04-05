import { Filter } from '@nestjs-query/core';

export type AuthorizationOperationGroup = 'read' | 'aggregate' | 'create' | 'update' | 'delete';

export interface AuthorizationContext {
  /** The name of the method that uses the @AuthorizeFilter decorator */
  operationName: string;

  /** The group this operation belongs to */
  operationGroup: AuthorizationOperationGroup;

  /** If the operation does not modify any entities */
  readonly: boolean;

  /** If the operation can affect multiple entities */
  many: boolean;
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
