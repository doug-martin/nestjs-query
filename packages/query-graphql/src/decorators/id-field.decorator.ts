import { Field, FieldOptions, ReturnTypeFunc } from '@nestjs/graphql'
import { Class, MetaValue, ValueReflector } from '@ptc-org/nestjs-query-core'

import { ID_FIELD_KEY } from './constants'
import { FilterableField, FilterableFieldOptions } from './filterable-field.decorator'

const reflector = new ValueReflector(ID_FIELD_KEY)
type NoFilterIDFieldOptions = {
  disableFilter: true
} & FieldOptions
export type IDFieldOptions = FilterableFieldOptions | NoFilterIDFieldOptions

export interface IDFieldDescriptor {
  propertyName: string
  returnTypeFunc: ReturnTypeFunc
}

/**
 * Decorator for Fields that should be filterable through a [[FilterType]]
 *
 * @example
 *
 * In the following DTO `id`, `title` and `completed` are filterable.
 *
 * ```ts
 * import { IDField } from '@ptc-org/nestjs-query-graphql';
 * import { ObjectType, ID } from '@nestjs/graphql';
 *
 * @ObjectType('TodoItem')
 * export class TodoItemDTO {
 *   @IDField(() => ID)
 *   id!: string;
 * }
 * ```
 */
export function IDField(returnTypeFunc: ReturnTypeFunc, options?: IDFieldOptions): PropertyDecorator & MethodDecorator {
  return <D>(
    // eslint-disable-next-line @typescript-eslint/ban-types
    target: Object,
    propertyName: string | symbol,
    descriptor?: TypedPropertyDescriptor<D>
  ): TypedPropertyDescriptor<D> | void => {
    reflector.set(target.constructor as Class<unknown>, {
      propertyName: propertyName.toString(),
      returnTypeFunc
    })
    const disableFilter = options && 'disableFilter' in options
    const FieldDecorator = disableFilter ? Field : FilterableField
    if (descriptor) {
      return FieldDecorator(returnTypeFunc, options)(target, propertyName, descriptor)
    }
    return FieldDecorator(returnTypeFunc, options)(target, propertyName)
  }
}

export function getIDField<DTO>(DTOClass: Class<DTO>): MetaValue<IDFieldDescriptor> {
  return reflector.get<DTO, IDFieldDescriptor>(DTOClass, true)
}
