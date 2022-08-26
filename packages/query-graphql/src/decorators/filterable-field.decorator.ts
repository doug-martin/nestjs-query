import { Field, FieldOptions, ReturnTypeFunc } from '@nestjs/graphql'
import { ArrayReflector, Class, FilterComparisonOperators, getPrototypeChain } from '@ptc-org/nestjs-query-core'

import { FILTERABLE_FIELD_KEY } from './constants'

const reflector = new ArrayReflector(FILTERABLE_FIELD_KEY)
export type FilterableFieldOptions = {
  allowedComparisons?: FilterComparisonOperators<unknown>[]
  filterRequired?: boolean
  filterOnly?: boolean
} & FieldOptions

export interface FilterableFieldDescriptor {
  propertyName: string
  target: Class<unknown>
  returnTypeFunc?: ReturnTypeFunc
  advancedOptions?: FilterableFieldOptions
}

/**
 * Decorator for Fields that should be filterable through a [[FilterType]]
 *
 * @example
 *
 * In the following DTO `id`, `title` and `completed` are filterable.
 *
 * ```ts
 * import { FilterableField } from '@ptc-org/nestjs-query-graphql';
 * import { ObjectType, ID, GraphQLISODateTime, Field } from '@nestjs/graphql';
 *
 * @ObjectType('TodoItem')
 * export class TodoItemDTO {
 *   @FilterableField(() => ID)
 *   id!: string;
 *
 *   @FilterableField()
 *   title!: string;
 *
 *   @FilterableField()
 *   completed!: boolean;
 *
 *   @Field(() => GraphQLISODateTime)
 *   created!: Date;
 *
 *   @Field(() => GraphQLISODateTime)
 *   updated!: Date;
 * }
 * ```
 */
export function FilterableField(): PropertyDecorator & MethodDecorator
export function FilterableField(options: FilterableFieldOptions): PropertyDecorator & MethodDecorator
export function FilterableField(
  returnTypeFunction?: ReturnTypeFunc,
  options?: FilterableFieldOptions
): PropertyDecorator & MethodDecorator
export function FilterableField(
  returnTypeFuncOrOptions?: ReturnTypeFunc | FilterableFieldOptions,
  maybeOptions?: FilterableFieldOptions
): MethodDecorator | PropertyDecorator {
  let returnTypeFunc: ReturnTypeFunc | undefined
  let advancedOptions: FilterableFieldOptions | undefined
  if (typeof returnTypeFuncOrOptions === 'function') {
    returnTypeFunc = returnTypeFuncOrOptions
    advancedOptions = maybeOptions
  } else if (typeof returnTypeFuncOrOptions === 'object') {
    advancedOptions = returnTypeFuncOrOptions
  } else if (typeof maybeOptions === 'object') {
    advancedOptions = maybeOptions
  }
  return <D>(
    // eslint-disable-next-line @typescript-eslint/ban-types
    target: Object,
    propertyName: string | symbol,
    descriptor: TypedPropertyDescriptor<D>
  ): TypedPropertyDescriptor<D> | void => {
    const Ctx = Reflect.getMetadata('design:type', target, propertyName) as Class<unknown>
    reflector.append(target.constructor as Class<unknown>, {
      propertyName: propertyName.toString(),
      target: Ctx,
      returnTypeFunc,
      advancedOptions
    })

    if (advancedOptions?.filterOnly) {
      return undefined
    }

    if (returnTypeFunc) {
      return Field(returnTypeFunc, advancedOptions)(target, propertyName, descriptor)
    }
    if (advancedOptions) {
      return Field(advancedOptions)(target, propertyName, descriptor)
    }
    return Field()(target, propertyName, descriptor)
  }
}

export function getFilterableFields<DTO>(DTOClass: Class<DTO>): FilterableFieldDescriptor[] {
  return getPrototypeChain(DTOClass).reduce((fields, Cls) => {
    const existingFieldNames = fields.map((t) => t.propertyName)
    const typeFields = reflector.get<unknown, FilterableFieldDescriptor>(Cls) ?? []
    const newFields = typeFields.filter((t) => !existingFieldNames.includes(t.propertyName))
    return [...newFields, ...fields]
  }, [] as FilterableFieldDescriptor[])
}
