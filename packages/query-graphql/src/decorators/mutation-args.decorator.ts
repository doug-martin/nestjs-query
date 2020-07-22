import { Class } from '@nestjs-query/core';
import { Args, GqlExecutionContext } from '@nestjs/graphql';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { composeDecorators } from './decorator.utils';
import { transformAndValidate } from '../resolvers/helpers';
import { MutationArgsType } from '../types';
import { HookFunc } from './hook.decorator';

export const MutationArgs = <HookType>(
  HookArgsClass: Class<MutationArgsType<HookType>>,
  hook?: HookFunc<HookType>,
): ParameterDecorator => {
  return composeDecorators(
    Args(),
    createParamDecorator(async (data: unknown, ctx: ExecutionContext) => {
      const gqlContext = GqlExecutionContext.create(ctx);
      const args = await transformAndValidate(HookArgsClass, gqlContext.getArgs());
      if (hook) {
        return Object.assign(args, { input: hook(args.input, gqlContext.getContext()) });
      }
      return args;
    })(),
  );
};
