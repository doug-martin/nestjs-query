import { Class } from '@nestjs-query/core';
import { GraphQLScalarType } from 'graphql';

/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export declare type TypeValue = Class<any> | GraphQLScalarType | Function | object | symbol;
/** @internal */
export declare type ReturnTypeFuncValue = TypeValue | [TypeValue];
/** @internal */
export declare type ReturnTypeFunc = (returns?: void) => ReturnTypeFuncValue;
/** @internal */
export declare type NullableListOptions = 'items' | 'itemsAndList';
/** @internal */
export interface DecoratorTypeOptions {
  nullable?: boolean | NullableListOptions;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValue?: any;
}
/** @internal */
export interface DescriptionOptions {
  description?: string;
}
/** @internal */
export interface DepreciationOptions {
  deprecationReason?: string;
}
/** @internal */
export interface SchemaNameOptions {
  name?: string;
}
/** @internal */
export declare type BasicOptions = DecoratorTypeOptions & DescriptionOptions;
/** @internal */
export declare type AdvancedOptions = BasicOptions & DepreciationOptions & SchemaNameOptions;
/** @internal */
export type MethodAndPropDecorator = PropertyDecorator & MethodDecorator;
