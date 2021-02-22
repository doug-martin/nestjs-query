import { Class } from '@nestjs-query/core';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { HookTypes, Hook, getHookToken } from '../hooks';

export type HookContext<H extends Hook<unknown>> = { hook?: H };

export function HookInterceptor(type: HookTypes, ...DTOClasses: Class<unknown>[]): Class<NestInterceptor> {
  const tokens = DTOClasses.map((Cls) => getHookToken(type, Cls));

  @Injectable()
  class Interceptor implements NestInterceptor {
    private hook?: Hook<unknown>;

    constructor(private readonly moduleRef: ModuleRef) {
      this.hook = this.lookupHook();
    }

    intercept(context: ExecutionContext, next: CallHandler) {
      const gqlContext = GqlExecutionContext.create(context);
      const ctx = gqlContext.getContext<HookContext<Hook<unknown>>>();
      if (this.hook) {
        ctx.hook = this.hook;
      }
      return next.handle();
    }

    private lookupHook(): Hook<unknown> | undefined {
      return tokens.reduce((h: Hook<unknown> | undefined, hookToken) => {
        if (h) {
          return h;
        }
        try {
          return this.moduleRef.get<Hook<unknown>>(hookToken);
        } catch {
          return undefined;
        }
      }, undefined);
    }
  }
  Object.defineProperty(Interceptor, 'name', {
    writable: false,
    // set a unique name otherwise DI does not inject a unique one for each request
    value: `${DTOClasses[0].name}${type}HookInterceptor`,
  });

  return Interceptor;
}
