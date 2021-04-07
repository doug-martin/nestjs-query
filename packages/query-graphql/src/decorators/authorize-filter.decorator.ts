import { ModifyRelationOptions } from '@nestjs-query/core';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthorizationContext, OperationGroup } from '../auth';
import { AuthorizerContext } from '../interceptors';

type PartialAuthorizationContext = Partial<AuthorizationContext> &
  Pick<AuthorizationContext, 'operationGroup' | 'many'>;

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

function getAuthorizationContext(
  methodName: string | symbol,
  partialAuthContext?: PartialAuthorizationContext,
): AuthorizationContext {
  if (!partialAuthContext)
    return new Proxy<AuthorizationContext>({} as AuthorizationContext, {
      get: () => {
        throw new Error(
          `No AuthorizationContext available for method ${methodName.toString()}! Make sure that you provide an AuthorizationContext to your custom methods as argument of the @AuthorizerFilter decorator.`,
        );
      },
    });

  return {
    operationName: methodName.toString(),
    readonly:
      partialAuthContext.operationGroup === OperationGroup.READ ||
      partialAuthContext.operationGroup === OperationGroup.AGGREGATE,
    ...partialAuthContext,
  };
}

export function AuthorizerFilter<DTO>(partialAuthContext?: PartialAuthorizationContext): ParameterDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    const authorizationContext = getAuthorizationContext(propertyKey, partialAuthContext);
    return createParamDecorator((data: unknown, executionContext: ExecutionContext) =>
      getAuthorizerFilter(getContext<AuthorizerContext<DTO>>(executionContext), authorizationContext),
    )()(target, propertyKey, parameterIndex);
  };
}

export function RelationAuthorizerFilter<DTO>(
  relationName: string,
  partialAuthContext?: PartialAuthorizationContext,
): ParameterDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    const authorizationContext = getAuthorizationContext(propertyKey, partialAuthContext);
    return createParamDecorator((data: unknown, executionContext: ExecutionContext) =>
      getRelationAuthFilter(getContext<AuthorizerContext<DTO>>(executionContext), relationName, authorizationContext),
    )()(target, propertyKey, parameterIndex);
  };
}

export function ModifyRelationAuthorizerFilter<DTO>(
  relationName: string,
  partialAuthContext?: PartialAuthorizationContext,
): ParameterDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    const authorizationContext = getAuthorizationContext(propertyKey, partialAuthContext);
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
