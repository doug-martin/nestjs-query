import { Class } from '@nestjs-query/core';
import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { getHookForType } from '../decorators';
import { HookTypes, Hook, getHookToken } from '../hooks';

export type HookContext<H extends Hook<unknown>> = { hook?: H };

class DefaultHookInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle();
  }
}

export function HookInterceptor(type: HookTypes, ...DTOClasses: Class<unknown>[]): Class<NestInterceptor> {
  const HookedClass = DTOClasses.find((Cls) => getHookForType(type, Cls));
  if (!HookedClass) {
    return DefaultHookInterceptor;
  }
  const hookToken = getHookToken(type, HookedClass);
  @Injectable()
  class Interceptor implements NestInterceptor {
    constructor(@Inject(hookToken) readonly hook: Hook<typeof HookedClass>) {}

    intercept(context: ExecutionContext, next: CallHandler) {
      const gqlContext = GqlExecutionContext.create(context);
      const ctx = gqlContext.getContext<HookContext<Hook<unknown>>>();
      ctx.hook = this.hook;
      return next.handle();
    }
  }
  Object.defineProperty(Interceptor, 'name', {
    writable: false,
    // set a unique name otherwise DI does not inject a unique one for each request
    value: `${DTOClasses[0].name}${type}HookInterceptor`,
  });

  return Interceptor;
}
