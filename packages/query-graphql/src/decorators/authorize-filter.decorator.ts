import { ModifyRelationOptions } from '@nestjs-query/core';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthorizerContext } from '../interceptors';

function getContext<C>(executionContext: ExecutionContext): C {
  const gqlExecutionContext = GqlExecutionContext.create(executionContext);
  return gqlExecutionContext.getContext<C>();
}

function getAuthorizerFilter<C extends AuthorizerContext<unknown>>(context: C, operationName: string) {
  if (!context.authorizer) {
    return undefined;
  }
  return context.authorizer.authorize(context, operationName);
}

function getRelationAuthFilter<C extends AuthorizerContext<unknown>>(
  context: C,
  relationName: string,
  operationName: string,
) {
  if (!context.authorizer) {
    return undefined;
  }
  return context.authorizer.authorizeRelation(relationName, context, operationName);
}

export function AuthorizerFilter<DTO>(operationName?: string): ParameterDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    const name = operationName ?? propertyKey.toString();
    return createParamDecorator((data: unknown, executionContext: ExecutionContext) =>
      getAuthorizerFilter(getContext<AuthorizerContext<DTO>>(executionContext), name),
    )()(target, propertyKey, parameterIndex);
  };
}

export function RelationAuthorizerFilter<DTO>(relationName: string, operationName?: string): ParameterDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    const name = operationName ?? propertyKey.toString();
    return createParamDecorator((data: unknown, executionContext: ExecutionContext) =>
      getRelationAuthFilter(getContext<AuthorizerContext<DTO>>(executionContext), relationName, name),
    )()(target, propertyKey, parameterIndex);
  };
}

export function ModifyRelationAuthorizerFilter<DTO>(relationName: string, operationName?: string): ParameterDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    const name = operationName ?? propertyKey.toString();
    return createParamDecorator(
      async (data: unknown, executionContext: ExecutionContext): Promise<ModifyRelationOptions<unknown, unknown>> => {
        const context = getContext<AuthorizerContext<DTO>>(executionContext);
        return {
          filter: await getAuthorizerFilter(context, name),
          relationFilter: await getRelationAuthFilter(context, relationName, name),
        };
      },
    )()(target, propertyKey, parameterIndex);
  };
}
