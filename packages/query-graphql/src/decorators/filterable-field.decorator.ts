import { Field } from 'type-graphql';
import { Class } from '@nestjs-query/core';
import { AdvancedOptions, MethodAndPropDecorator, ReturnTypeFunc } from '../external/type-graphql.types';
import { getMetadataStorage } from '../metadata';

export interface FilterableFieldDescriptor<T> {
  propertyName: string;
  type: Class<T>;
  returnTypeFunc?: ReturnTypeFunc;
  advancedOptions?: AdvancedOptions;
}

export const filterFieldMetaDataKey = 'filter:field';

export function FilterableField(): MethodAndPropDecorator;
export function FilterableField(options: AdvancedOptions): MethodAndPropDecorator;
export function FilterableField(returnTypeFunction?: ReturnTypeFunc, options?: AdvancedOptions): MethodAndPropDecorator;
export function FilterableField(
  returnTypeFuncOrOptions?: ReturnTypeFunc | AdvancedOptions,
  maybeOptions?: AdvancedOptions,
): MethodDecorator | PropertyDecorator {
  let returnTypeFunc: ReturnTypeFunc | undefined;
  let advancedOptions: AdvancedOptions | undefined;
  if (typeof returnTypeFuncOrOptions === 'function') {
    returnTypeFunc = returnTypeFuncOrOptions;
    advancedOptions = maybeOptions;
  } else if (typeof returnTypeFuncOrOptions === 'object') {
    advancedOptions = returnTypeFuncOrOptions;
  } else if (typeof maybeOptions === 'object') {
    advancedOptions = maybeOptions;
  }
  return <D>(
    // eslint-disable-next-line @typescript-eslint/ban-types
    target: Object,
    propertyName: string | symbol,
    descriptor: TypedPropertyDescriptor<D>,
  ): TypedPropertyDescriptor<D> | void => {
    const Ctx = Reflect.getMetadata('design:type', target.constructor.prototype, propertyName);
    getMetadataStorage().addFilterableObjectField(target.constructor as Class<unknown>, {
      propertyName: propertyName.toString(),
      type: Ctx,
      returnTypeFunc,
      advancedOptions,
    });
    return Field(returnTypeFunc, advancedOptions)(target, propertyName, descriptor);
  };
}
