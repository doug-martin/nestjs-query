import { ModifyRelationOptions } from '@nestjs-query/core';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthorizationContext, AuthorizationOperationGroup } from '../auth';
import { AuthorizerContext } from '../interceptors';

function getContext<C>(executionContext: ExecutionContext): C {
  const gqlExecutionContext = GqlExecutionContext.create(executionContext);
  return gqlExecutionContext.getContext<C>();
}

function getAuthorizerFilter<C extends AuthorizerContext<unknown>>(
  context: C,
  authorizationContext: AuthorizationContext,
) {
  if (!context.authorizer) {
    return undefined;
  }
  return context.authorizer.authorize(context, authorizationContext);
}

function getRelationAuthFilter<C extends AuthorizerContext<unknown>>(
  context: C,
  relationName: string,
  authorizationContext: AuthorizationContext,
) {
  if (!context.authorizer) {
    return undefined;
  }
  return context.authorizer.authorizeRelation(relationName, context, authorizationContext);
}

function getAuthorizationContext(operationNameOrContext: string | AuthorizationContext): AuthorizationContext {
  if (typeof operationNameOrContext !== 'string') {
    return operationNameOrContext;
  }

  const lcMethodName = operationNameOrContext.toLowerCase();

  const isCreate = lcMethodName.startsWith('create');
  const isUpdate = lcMethodName.startsWith('update') || lcMethodName.startsWith('set');
  const isDelete = lcMethodName.startsWith('delete') || lcMethodName.startsWith('remove');
  const isAggregate = lcMethodName.startsWith('aggregate');
  const isQuery = lcMethodName.startsWith('query');
  const isFind = lcMethodName.startsWith('find');
  const isMany = lcMethodName.endsWith('many');

  let operationGroup: AuthorizationOperationGroup = 'read';

  if (isCreate) {
    operationGroup = 'create';
  } else if (isDelete) {
    operationGroup = 'delete';
  } else if (isUpdate) {
    operationGroup = 'update';
  } else if (isAggregate) {
    operationGroup = 'aggregate';
  }

  return {
    operationName: operationNameOrContext,
    operationGroup,
    readonly: isQuery || isFind || isAggregate,
    many: isMany || isQuery || isAggregate,
  };
}

export function AuthorizerFilter(): ParameterDecorator;
export function AuthorizerFilter(context: AuthorizationContext): ParameterDecorator;
export function AuthorizerFilter(operationName: string): ParameterDecorator;
export function AuthorizerFilter<DTO>(operationNameOrContext?: string | AuthorizationContext): ParameterDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    const authorizationContext = getAuthorizationContext(operationNameOrContext ?? propertyKey.toString());
    return createParamDecorator((data: unknown, executionContext: ExecutionContext) =>
      getAuthorizerFilter(getContext<AuthorizerContext<DTO>>(executionContext), authorizationContext),
    )()(target, propertyKey, parameterIndex);
  };
}

export function RelationAuthorizerFilter(relationName: string): ParameterDecorator;
export function RelationAuthorizerFilter(relationName: string, operationName: string): ParameterDecorator;
export function RelationAuthorizerFilter(relationName: string, context: AuthorizationContext): ParameterDecorator;
export function RelationAuthorizerFilter<DTO>(
  relationName: string,
  operationNameOrContext?: string | AuthorizationContext,
): ParameterDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    const authorizationContext = getAuthorizationContext(operationNameOrContext ?? propertyKey.toString());
    return createParamDecorator((data: unknown, executionContext: ExecutionContext) =>
      getRelationAuthFilter(getContext<AuthorizerContext<DTO>>(executionContext), relationName, authorizationContext),
    )()(target, propertyKey, parameterIndex);
  };
}

export function ModifyRelationAuthorizerFilter(relationName: string): ParameterDecorator;
export function ModifyRelationAuthorizerFilter(relationName: string, operationName: string): ParameterDecorator;
export function ModifyRelationAuthorizerFilter(relationName: string, context: AuthorizationContext): ParameterDecorator;
export function ModifyRelationAuthorizerFilter<DTO>(
  relationName: string,
  operationNameOrContext?: string | AuthorizationContext,
): ParameterDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    const authorizationContext = getAuthorizationContext(operationNameOrContext ?? propertyKey.toString());
    return createParamDecorator(
      async (data: unknown, executionContext: ExecutionContext): Promise<ModifyRelationOptions<unknown, unknown>> => {
        const context = getContext<AuthorizerContext<DTO>>(executionContext);
        return {
          filter: await getAuthorizerFilter(context, authorizationContext),
          relationFilter: await getRelationAuthFilter(context, relationName, authorizationContext),
        };
      },
    )()(target, propertyKey, parameterIndex);
  };
}
