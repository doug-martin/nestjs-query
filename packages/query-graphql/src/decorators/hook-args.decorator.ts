import { Class, MetaValue } from '@nestjs-query/core';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Args, GqlExecutionContext } from '@nestjs/graphql';
import { HookFunc } from './hook.decorator';
import { composeDecorators } from './decorator.utils';
import { transformAndValidate } from '../resolvers/helpers';

export const HookArgs = <HookType>(
  HookArgsClass: Class<HookType>,
  ...hooks: MetaValue<HookFunc<HookType>>[]
): ParameterDecorator =>
  composeDecorators(
    Args(),
    createParamDecorator(async (data: unknown, ctx: ExecutionContext) => {
      const gqlContext = GqlExecutionContext.create(ctx);
      const args = await transformAndValidate(HookArgsClass, gqlContext.getArgs());
      if (hooks && hooks.length) {
        return hooks.reduce(
          (hookedArgs, hook) =>
            hook ? Object.assign(hookedArgs, hook(hookedArgs, gqlContext.getContext())) : hookedArgs,
          args,
        );
      }
      return args;
    })(),
  );
