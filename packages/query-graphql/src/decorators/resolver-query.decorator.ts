import { applyDecorators } from '@nestjs/common'
import { Query, QueryOptions, ReturnTypeFunc } from '@nestjs/graphql'

import { isDisabled, ResolverMethod, ResolverMethodOpts } from './resolver-method.decorator'

export interface QueryResolverMethodOpts extends ResolverMethodOpts {
  withDeleted?: boolean
}

/**
 * @internal
 * Decorator for a graphql `query` endpoint.
 * @param typeFunc - A function that returns the return type for the query.
 * @param options - `@nestjs/graphql` options to apply to the mutation.
 * @param opts -  [[ResolverMethodOpts]] to apply to the mutation
 */
export function ResolverQuery(
  typeFunc: ReturnTypeFunc,
  options?: QueryOptions,
  ...opts: QueryResolverMethodOpts[]
): MethodDecorator {
  if (isDisabled(opts)) {
    return (): void => {}
  }
  return applyDecorators(Query(typeFunc, options), ResolverMethod(...opts))
}
