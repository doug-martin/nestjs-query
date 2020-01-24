import { Mutation } from '@nestjs/graphql';
import { AdvancedOptions, ReturnTypeFunc } from '../external/type-graphql.types';
import { isDisabled, ResolverMethod, ResolverMethodOpts } from './resolver-method.decorator';

/**
 * @internal
 * Decorator for a graphql `mutation` endpoint.
 * @param typeFunc - A function that returns the return type for the mutation.
 * @param options - `type-graphql` options to apply to the mutation.
 * @param opts -  [[ResolverMethodOpts]] to apply to the mutation
 */
export function ResolverMutation(typeFunc: ReturnTypeFunc, options?: AdvancedOptions, ...opts: ResolverMethodOpts[]) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return <T>(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<T>): void => {
    if (isDisabled(opts)) {
      return;
    }
    Mutation(typeFunc, options)(target, propertyKey, descriptor);
    ResolverMethod(...opts)(target, propertyKey, descriptor);
  };
}
