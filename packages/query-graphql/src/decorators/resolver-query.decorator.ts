import { Query } from '@nestjs/graphql';
import { isDisabled, ResolverMethod, ResolverMethodOpts } from './resolver-method.decorator';
import { AdvancedOptions, ReturnTypeFunc } from '../external/type-graphql.types';

/**
 * @internal
 * Decorator for a graphql `query` endpoint.
 * @param typeFunc - A function that returns the return type for the query.
 * @param options - `type-graphql` options to apply to the mutation.
 * @param opts -  [[ResolverMethodOpts]] to apply to the mutation
 */
export function ResolverQuery(typeFunc: ReturnTypeFunc, options?: AdvancedOptions, ...opts: ResolverMethodOpts[]) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return <T>(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<T>): void => {
    if (isDisabled(opts)) {
      return;
    }
    Query(typeFunc, options)(target, propertyKey, descriptor);
    ResolverMethod(...opts)(target, propertyKey, descriptor);
  };
}
