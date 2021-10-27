import { Class, ModifyRelationOptions } from '@nestjs-query/core';
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

function getAuthorizerFilter<DTO extends Class<unknown>, C extends AuthorizerContext>(
  dto: DTO,
  context: C,
  authorizationContext: AuthorizationContext,
) {
  if (!context.authorizer) {
    throw new Error('Global Authorizer not found. Did you register the root module?');
  }
  return context.authorizer.authorize(dto, context, authorizationContext);
}

function getRelationAuthFilter<ParentDTO extends Class<unknown>, C extends AuthorizerContext>(
  parentDto: ParentDTO,
  context: C,
  relationName: string,
  authorizationContext: AuthorizationContext,
) {
  if (!context.authorizer) {
    throw new Error('Global Authorizer not found. Did you register the root module?');
  }
  return context.authorizer.authorizeRelation(parentDto, relationName, context, authorizationContext);
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

export function AuthorizerFilter<DTO extends Class<unknown>>(
  dto: DTO,
  partialAuthContext?: PartialAuthorizationContext,
): ParameterDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    const authorizationContext = getAuthorizationContext(propertyKey, partialAuthContext);
    return createParamDecorator((data: unknown, executionContext: ExecutionContext) =>
      getAuthorizerFilter(dto, getContext<AuthorizerContext>(executionContext), authorizationContext),
    )()(target, propertyKey, parameterIndex);
  };
}

export function RelationAuthorizerFilter<DTO extends Class<unknown>>(
  parentDto: DTO,
  relationName: string,
  partialAuthContext?: PartialAuthorizationContext,
): ParameterDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    const authorizationContext = getAuthorizationContext(propertyKey, partialAuthContext);
    return createParamDecorator((data: unknown, executionContext: ExecutionContext) =>
      getRelationAuthFilter(
        parentDto,
        getContext<AuthorizerContext>(executionContext),
        relationName,
        authorizationContext,
      ),
    )()(target, propertyKey, parameterIndex);
  };
}

export function ModifyRelationAuthorizerFilter<DTO extends Class<unknown>>(
  dto: DTO,
  relationName: string,
  partialAuthContext?: PartialAuthorizationContext,
): ParameterDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    const authorizationContext = getAuthorizationContext(propertyKey, partialAuthContext);
    return createParamDecorator(
      async (data: unknown, executionContext: ExecutionContext): Promise<ModifyRelationOptions<unknown, unknown>> => {
        const context = getContext<AuthorizerContext>(executionContext);
        return {
          filter: await getAuthorizerFilter(dto, context, authorizationContext),
          relationFilter: await getRelationAuthFilter(dto, context, relationName, authorizationContext),
        };
      },
    )()(target, propertyKey, parameterIndex);
  };
}
