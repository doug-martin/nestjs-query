import { Query } from '@nestjs/graphql';
import { applyDecorators } from '@nestjs/common';
import { isDisabled, ResolverMethod, ResolverMethodOpts } from './resolver-method.decorator';
import { AdvancedOptions, ReturnTypeFunc } from '../external/type-graphql.types';

/**
 * @internal
 * Decorator for a graphql `query` endpoint.
 * @param typeFunc - A function that returns the return type for the query.
 * @param options - `type-graphql` options to apply to the mutation.
 * @param opts -  [[ResolverMethodOpts]] to apply to the mutation
 */
export function ResolverQuery(
  typeFunc: ReturnTypeFunc,
  options?: AdvancedOptions,
  ...opts: ResolverMethodOpts[]
): MethodDecorator {
  if (isDisabled(opts)) {
    return () => undefined;
  }
  return applyDecorators(Query(typeFunc, options), ResolverMethod(...opts));
}
