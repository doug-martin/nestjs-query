import { Field } from 'type-graphql';
import { Class } from '@nestjs-query/core';
import { AdvancedOptions, MethodAndPropDecorator, ReturnTypeFunc } from '../external/type-graphql.types';
import { getMetadataStorage } from '../metadata';

/** @internal */
export const filterFieldMetaDataKey = 'filter:field';

/**
 * Decorator for Fields that should be filterable through a [[FilterType]]
 *
 * @example
 *
 * In the following DTO `id`, `title` and `completed` are filterable.
 *
 * ```ts
 * import { FilterableField } from '@nestjs-query/query-graphql';
 * import { ObjectType, ID, GraphQLISODateTime, Field } from 'type-graphql';
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
      target: Ctx,
      returnTypeFunc,
      advancedOptions,
    });
    return Field(returnTypeFunc, advancedOptions)(target, propertyName, descriptor);
  };
}
