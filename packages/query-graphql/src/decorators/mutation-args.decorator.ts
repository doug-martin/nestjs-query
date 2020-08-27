import { Class, MetaValue } from '@nestjs-query/core';
import { MutationArgsType } from '../types';
import { HookFunc } from './hook.decorator';
import { HookArgs } from './hook-args.decorator';

export const MutationArgs = <HookType>(
  HookArgsClass: Class<MutationArgsType<HookType>>,
  hook: MetaValue<HookFunc<HookType>>,
): ParameterDecorator => {
  if (!hook) {
    return HookArgs(HookArgsClass);
  }
  return HookArgs(HookArgsClass, (args, context) => Object.assign(args, { input: hook(args.input, context) }));
};
