import { Type } from '@nestjs/common';
import { isFunction } from '@nestjs/common/utils/shared.utils';
import {
  applyIsOptionalDecorator,
  inheritPropertyInitializers,
  inheritTransformationMetadata,
  inheritValidationMetadata,
} from '@nestjs/mapped-types';
import { Field } from '@nestjs/graphql';
import { ClassDecoratorFactory } from '@nestjs/graphql/dist/interfaces/class-decorator-factory.interface';
import { getFieldsAndDecoratorForType } from '@nestjs/graphql/dist/schema-builder/utils/get-fields-and-decorator.util';
import { applyFieldDecorators } from '@nestjs/graphql/dist/type-helpers/type-helpers.utils';
import { METADATA_FACTORY_NAME } from '@nestjs/graphql/dist/plugin/plugin-constants';
import { FilterableField, getFilterableFields } from '../decorators';

interface Indexable {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export function PartialType<T>(classRef: Type<T>, decorator?: ClassDecoratorFactory): Type<Partial<T>> {
  const { fields, decoratorFactory } = getFieldsAndDecoratorForType(classRef);
  const filterableFields = getFilterableFields(classRef);

  abstract class PartialObjectType {
    constructor() {
      inheritPropertyInitializers(this, classRef);
    }
  }
  if (decorator) {
    decorator({ isAbstract: true })(PartialObjectType);
  } else {
    decoratorFactory({ isAbstract: true })(PartialObjectType);
  }

  inheritValidationMetadata(classRef, PartialObjectType);
  inheritTransformationMetadata(classRef, PartialObjectType);

  fields.forEach((item) => {
    if (isFunction(item.typeFn)) {
      /**
       * Execute type function eagarly to update the type options object (before "clone" operation)
       * when the passed function (e.g., @Field(() => Type)) lazily returns an array.
       */
      item.typeFn();
    }
    const filterableField = filterableFields.find((f) => f.propertyName === item.name);
    if (filterableField) {
      FilterableField(item.typeFn, { ...filterableField.advancedOptions, nullable: true })(
        PartialObjectType.prototype,
        item.name,
      );
    } else {
      Field(item.typeFn, { ...item.options, nullable: true })(PartialObjectType.prototype, item.name);
    }
    applyIsOptionalDecorator(PartialObjectType, item.name);
    applyFieldDecorators(PartialObjectType, item);
  });

  if ((PartialObjectType as Indexable)[METADATA_FACTORY_NAME]) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const pluginFields = Object.keys((PartialObjectType as Indexable)[METADATA_FACTORY_NAME]());
    pluginFields.forEach((key) => applyIsOptionalDecorator(PartialObjectType, key));
  }

  Object.defineProperty(PartialObjectType, 'name', {
    value: `Partial${classRef.name}`,
  });

  return PartialObjectType as Type<Partial<T>>;
}
