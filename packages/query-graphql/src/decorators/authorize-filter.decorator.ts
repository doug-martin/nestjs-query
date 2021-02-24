import { ModifyRelationOptions } from '@nestjs-query/core';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthorizerContext } from '../interceptors';

function getContext<C>(executionContext: ExecutionContext): C {
  const gqlExecutionContext = GqlExecutionContext.create(executionContext);
  return gqlExecutionContext.getContext<C>();
}

function getAuthorizerFilter<C extends AuthorizerContext<unknown>>(context: C) {
  if (!context.authorizer) {
    return undefined;
  }
  return context.authorizer.authorize(context);
}

function getRelationAuthFilter<C extends AuthorizerContext<unknown>>(context: C, relationName: string) {
  if (!context.authorizer) {
    return undefined;
  }
  return context.authorizer.authorizeRelation(relationName, context);
}

export function AuthorizerFilter<DTO>(): ParameterDecorator {
  return createParamDecorator((data: unknown, executionContext: ExecutionContext) =>
    getAuthorizerFilter(getContext<AuthorizerContext<DTO>>(executionContext)),
  )();
}

export function RelationAuthorizerFilter<DTO>(relationName: string): ParameterDecorator {
  return createParamDecorator((data: unknown, executionContext: ExecutionContext) =>
    getRelationAuthFilter(getContext<AuthorizerContext<DTO>>(executionContext), relationName),
  )();
}

export function ModifyRelationAuthorizerFilter<DTO>(relationName: string): ParameterDecorator {
  return createParamDecorator(
    async (data: unknown, executionContext: ExecutionContext): Promise<ModifyRelationOptions<unknown, unknown>> => {
      const context = getContext<AuthorizerContext<DTO>>(executionContext);
      return {
        filter: await getAuthorizerFilter(context),
        relationFilter: await getRelationAuthFilter(context, relationName),
      };
    },
  )();
}
