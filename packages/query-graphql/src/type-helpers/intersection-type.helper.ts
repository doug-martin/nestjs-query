import { Type } from '@nestjs/common';
import { Field } from '@nestjs/graphql';
import {
  inheritPropertyInitializers,
  inheritTransformationMetadata,
  inheritValidationMetadata,
} from '@nestjs/mapped-types';
import { ClassDecoratorFactory } from '@nestjs/graphql/dist/interfaces/class-decorator-factory.interface';
import { getFieldsAndDecoratorForType } from '@nestjs/graphql/dist/schema-builder/utils/get-fields-and-decorator.util';
import { applyFieldDecorators } from '@nestjs/graphql/dist/type-helpers/type-helpers.utils';
import { FilterableField, getFilterableFields } from '../decorators';

export function IntersectionType<A, B>(
  classARef: Type<A>,
  classBRef: Type<B>,
  decorator?: ClassDecoratorFactory,
): Type<A & B> {
  const { decoratorFactory, fields: fieldsA } = getFieldsAndDecoratorForType(classARef);
  const filterableFieldsA = getFilterableFields(classARef);

  const { fields: fieldsB } = getFieldsAndDecoratorForType(classBRef);
  const filterableFieldsB = getFilterableFields(classBRef);
  const fields = [...fieldsA, ...fieldsB];
  const filterableFields = [...filterableFieldsA, ...filterableFieldsB];

  abstract class IntersectionObjectType {
    constructor() {
      inheritPropertyInitializers(this, classARef);
      inheritPropertyInitializers(this, classBRef);
    }
  }
  if (decorator) {
    decorator({ isAbstract: true })(IntersectionObjectType);
  } else {
    decoratorFactory({ isAbstract: true })(IntersectionObjectType);
  }

  inheritValidationMetadata(classARef, IntersectionObjectType);
  inheritTransformationMetadata(classARef, IntersectionObjectType);
  inheritValidationMetadata(classBRef, IntersectionObjectType);
  inheritTransformationMetadata(classBRef, IntersectionObjectType);

  fields.forEach((item) => {
    const filterableField = filterableFields.find((f) => f.propertyName === item.name);
    if (filterableField) {
      FilterableField(item.typeFn, { ...filterableField.advancedOptions })(IntersectionObjectType.prototype, item.name);
    } else {
      Field(item.typeFn, { ...item.options })(IntersectionObjectType.prototype, item.name);
    }
    applyFieldDecorators(IntersectionObjectType, item);
  });

  Object.defineProperty(IntersectionObjectType, 'name', {
    value: `Intersection${classARef.name}${classBRef.name}`,
  });
  return IntersectionObjectType as Type<A & B>;
}
