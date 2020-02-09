import { ResolveProperty } from '@nestjs/graphql';
import { applyDecorators } from '@nestjs/common';
import { AdvancedOptions, ReturnTypeFunc } from '../external/type-graphql.types';
import { isDisabled, ResolverMethod, ResolverMethodOpts } from './resolver-method.decorator';

/**
 * @internal
 * Decorator for resolving properties on.
 * @param name - the name of the property in graphql.
 * @param typeFunc - A function that returns the return type for the mutation.
 * @param options - `type-graphql` options to apply to the mutation.
 * @param opts -  [[ResolverMethodOpts]] to apply to the mutation
 */
export function ResolverProperty(
  name: string,
  typeFunc: ReturnTypeFunc,
  options?: AdvancedOptions,
  ...opts: ResolverMethodOpts[]
): MethodDecorator {
  if (isDisabled(opts)) {
    return () => undefined;
  }
  return applyDecorators(ResolveProperty(name, typeFunc, options), ResolverMethod(...opts));
}
