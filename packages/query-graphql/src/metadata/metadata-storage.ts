import { ObjectClassMetadata } from 'type-graphql/dist/metadata/definitions/object-class-metdata';
import { getMetadataStorage } from 'type-graphql/dist/metadata/getMetadataStorage';
import { MetadataStorage } from 'type-graphql/dist/metadata/metadata-storage';
import { Class, Filter } from '@nestjs-query/core';
import { AdvancedOptions, ReturnTypeFunc } from '../external/type-graphql.types';

export interface FilterableFieldDescriptor<T> {
  propertyName: string;
  type: Class<T>;
  returnTypeFunc?: ReturnTypeFunc;
  advancedOptions?: AdvancedOptions;
}

const typeGraphqlMetadataStorage: () => MetadataStorage = () => getMetadataStorage();

export class GraphQLQueryMetadataStorage {
  readonly filterableObjectStorage: Map<Class<unknown>, FilterableFieldDescriptor<unknown>[]>;

  readonly filterTypeObjectStorage: Map<Class<unknown>, Class<Filter<unknown>>>;

  constructor() {
    this.filterableObjectStorage = new Map();
    this.filterTypeObjectStorage = new Map();
  }

  addFilterableObjectField<T>(type: Class<T>, field: FilterableFieldDescriptor<unknown>): void {
    let fields = this.filterableObjectStorage.get(type);
    if (!fields) {
      fields = [];
      this.filterableObjectStorage.set(type, fields);
    }
    fields.push(field);
  }

  getFilterableObjectFields<T>(type: Class<T>): FilterableFieldDescriptor<unknown>[] | undefined {
    return this.filterableObjectStorage.get(type);
  }

  addFilterableType<T>(type: Class<T>, filterType: Class<Filter<T>>): void {
    this.filterTypeObjectStorage.set(type, filterType);
  }

  getFilterType<T>(type: Class<T>): Class<Filter<T>> | undefined {
    return this.filterTypeObjectStorage.get(type);
  }

  getTypeGraphqlObjectMetadata<T>(objType: Class<T>): ObjectClassMetadata | undefined {
    return typeGraphqlMetadataStorage().objectTypes.find(o => o.target === objType);
  }

  clear(): void {
    typeGraphqlMetadataStorage().clear();
    this.filterableObjectStorage.clear();
  }
}
