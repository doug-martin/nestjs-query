import { applyDecorators } from '@nestjs/common'
import { ResolveField, ResolveFieldOptions, ReturnTypeFunc } from '@nestjs/graphql'

import { isDisabled, ResolverMethod, ResolverMethodOpts } from './resolver-method.decorator'

/**
 * @internal
 * Decorator for resolving properties on.
 * @param name - the name of the property in graphql.
 * @param typeFunc - A function that returns the return type for the mutation.
 * @param options - `@nestjs/graphql` options to apply to the mutation.
 * @param opts -  [[ResolverMethodOpts]] to apply to the mutation
 */
export function ResolverField(
  name: string,
  typeFunc: ReturnTypeFunc,
  options?: ResolveFieldOptions,
  ...opts: ResolverMethodOpts[]
): MethodDecorator {
  if (isDisabled(opts)) {
    return (): void => {}
  }
  return applyDecorators(ResolveField(name, typeFunc, options), ResolverMethod(...opts))
}
