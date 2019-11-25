import { Query } from '@nestjs/graphql';
import { isDisabled, ResolverMethod, ResolverMethodOptions } from './resolver-method.decorator';
import { AdvancedOptions, ReturnTypeFunc } from '../external/type-graphql.types';

export function ResolverQuery(typeFunc: ReturnTypeFunc, options?: AdvancedOptions, ...opts: ResolverMethodOptions[]) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return <T>(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<T>): void => {
    if (isDisabled(opts)) {
      return;
    }
    Query(typeFunc, options)(target, propertyKey, descriptor);
    ResolverMethod(...opts)(target, propertyKey, descriptor);
  };
}
