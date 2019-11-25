import { Mutation } from '@nestjs/graphql';
import { AdvancedOptions, ReturnTypeFunc } from '../external/type-graphql.types';
import { isDisabled, ResolverMethod, ResolverMethodOptions } from './resolver-method.decorator';

export function ResolverMutation(
  typeFunc: ReturnTypeFunc,
  options?: AdvancedOptions,
  ...opts: ResolverMethodOptions[]
) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return <T>(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<T>): void => {
    if (isDisabled(opts)) {
      return;
    }
    Mutation(typeFunc, options)(target, propertyKey, descriptor);
    ResolverMethod(...opts)(target, propertyKey, descriptor);
  };
}
