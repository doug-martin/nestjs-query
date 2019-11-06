import { Type } from '@nestjs/common';
import { GraphQLScalarType } from 'graphql';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export declare type TypeValue = Type<any> | GraphQLScalarType | Function | object | symbol;
export declare type ReturnTypeFuncValue = TypeValue | [TypeValue];
export declare type ReturnTypeFunc = (returns?: void) => ReturnTypeFuncValue;
export declare type NullableListOptions = 'items' | 'itemsAndList';
export interface DecoratorTypeOptions {
  nullable?: boolean | NullableListOptions;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValue?: any;
}

export interface DescriptionOptions {
  description?: string;
}
export interface DepreciationOptions {
  deprecationReason?: string;
}
export interface SchemaNameOptions {
  name?: string;
}
export declare type BasicOptions = DecoratorTypeOptions & DescriptionOptions;
export declare type AdvancedOptions = BasicOptions & DepreciationOptions & SchemaNameOptions;
export type MethodAndPropDecorator = PropertyDecorator & MethodDecorator;
