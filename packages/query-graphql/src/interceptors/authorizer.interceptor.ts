import { Class } from '@nestjs-query/core';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { InjectAuthorizer } from '../decorators';
import { Authorizer } from '../auth';

export type AuthorizerContext<DTO> = { authorizer: Authorizer<DTO> };

export function AuthorizerInterceptor<DTO>(DTOClass: Class<DTO>): Class<NestInterceptor> {
  @Injectable()
  class Interceptor implements NestInterceptor {
    constructor(@InjectAuthorizer(DTOClass) readonly authorizer: Authorizer<DTO>) {}

    intercept(context: ExecutionContext, next: CallHandler) {
      const gqlContext = GqlExecutionContext.create(context);
      const ctx = gqlContext.getContext<AuthorizerContext<DTO>>();
      ctx.authorizer = this.authorizer;
      return next.handle();
    }
  }
  Object.defineProperty(Interceptor, 'name', {
    writable: false,
    // set a unique name otherwise DI does not inject a unique one for each request
    value: `${DTOClass.name}AuthorizerInterceptor`,
  });

  return Interceptor;
}
