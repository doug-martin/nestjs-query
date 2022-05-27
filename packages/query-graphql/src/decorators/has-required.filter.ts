import { FilterFieldComparison } from '@ptc-org/nestjs-query-core';
import { registerDecorator } from 'class-validator';

/**
 * @internal
 * Wraps Args to allow skipping decorating
 * @param check - checker to run.
 * @param decorators - The decorators to apply
 */
export function HasRequiredFilter<T>(): PropertyDecorator {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'hasRequiredFilter',
      target: object.constructor,
      propertyName: propertyName,
      // constraints: [property],
      options: {
        message: 'There was no filter provided for "$property"!'
      },
      validator: {
        validate(value: FilterFieldComparison<T>) {
          return Object.keys(value).length > 0;
        }
      }
    });
  };
}
