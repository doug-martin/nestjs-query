import { Class, FilterComparisonOperators } from '@nestjs-query/core';
import { Field, FieldOptions, ReturnTypeFunc } from '@nestjs/graphql';
import { getMetadataStorage } from '../metadata';

export type FilterableFieldOptions = {
  allowedComparisons?: FilterComparisonOperators<unknown>[];
} & FieldOptions;
/**
 * Decorator for Fields that should be filterable through a [[FilterType]]
 *
 * @example
 *
 * In the following DTO `id`, `title` and `completed` are filterable.
 *
 * ```ts
 * import { FilterableField } from '@nestjs-query/query-graphql';
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
export function FilterableField(): PropertyDecorator & MethodDecorator;
export function FilterableField(options: FilterableFieldOptions): PropertyDecorator & MethodDecorator;
export function FilterableField(
  returnTypeFunction?: ReturnTypeFunc,
  options?: FilterableFieldOptions,
): PropertyDecorator & MethodDecorator;
export function FilterableField<T>(
  returnTypeFuncOrOptions?: ReturnTypeFunc | FilterableFieldOptions,
  maybeOptions?: FilterableFieldOptions,
): MethodDecorator | PropertyDecorator {
  let returnTypeFunc: ReturnTypeFunc | undefined;
  let advancedOptions: FilterableFieldOptions | undefined;
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
    const Ctx = Reflect.getMetadata('design:type', target.constructor.prototype, propertyName) as Class<unknown>;
    getMetadataStorage().addFilterableObjectField(target.constructor as Class<unknown>, {
      propertyName: propertyName.toString(),
      target: Ctx,
      returnTypeFunc,
      advancedOptions,
    });
    if (returnTypeFunc) {
      return Field(returnTypeFunc, advancedOptions)(target, propertyName, descriptor);
    }
    if (advancedOptions) {
      return Field(advancedOptions)(target, propertyName, descriptor);
    }
    return Field()(target, propertyName, descriptor);
  };
}
