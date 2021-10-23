import { Type } from '@nestjs/common';
import { isFunction } from '@nestjs/common/utils/shared.utils';
import {
  inheritPropertyInitializers,
  inheritTransformationMetadata,
  inheritValidationMetadata,
} from '@nestjs/mapped-types';
import { Field } from '@nestjs/graphql';
import { ClassDecoratorFactory } from '@nestjs/graphql/dist/interfaces/class-decorator-factory.interface';
import { getFieldsAndDecoratorForType } from '@nestjs/graphql/dist/schema-builder/utils/get-fields-and-decorator.util';
import { applyFieldDecorators } from '@nestjs/graphql/dist/type-helpers/type-helpers.utils';
import { FilterableField, getFilterableFields } from '../decorators';

export function PickType<T, K extends keyof T>(
  classRef: Type<T>,
  keys: readonly K[],
  decorator?: ClassDecoratorFactory,
): Type<Pick<T, typeof keys[number]>> {
  const { fields, decoratorFactory } = getFieldsAndDecoratorForType(classRef);
  const filterableFields = getFilterableFields(classRef);

  const isInheritedPredicate = (propertyKey: string) => keys.includes(propertyKey as K);
  abstract class PickObjectType {
    constructor() {
      inheritPropertyInitializers(this, classRef, isInheritedPredicate);
    }
  }
  decoratorFactory({ isAbstract: true })(PickObjectType);
  if (decorator) {
    decorator({ isAbstract: true })(PickObjectType);
  } else {
    decoratorFactory({ isAbstract: true })(PickObjectType);
  }

  inheritValidationMetadata(classRef, PickObjectType, isInheritedPredicate);
  inheritTransformationMetadata(classRef, PickObjectType, isInheritedPredicate);

  fields
    .filter((item) => keys.includes(item.name as K))
    .forEach((item) => {
      if (isFunction(item.typeFn)) {
        /**
         * Execute type function eagerly to update the type options object (before "clone" operation)
         * when the passed function (e.g., @Field(() => Type)) lazily returns an array.
         */
        item.typeFn();
      }
      const filterableField = filterableFields.find((f) => f.propertyName === item.name);
      if (filterableField) {
        FilterableField(item.typeFn, { ...filterableField.advancedOptions })(PickObjectType.prototype, item.name);
      } else {
        Field(item.typeFn, { ...item.options })(PickObjectType.prototype, item.name);
      }
      applyFieldDecorators(PickObjectType, item);
    });

  return PickObjectType as Type<Pick<T, typeof keys[number]>>;
}
