import { Type } from '@nestjs/common';
import { ObjectClassMetadata } from 'type-graphql/dist/metadata/definitions/object-class-metdata';
import { getMetadataStorage } from 'type-graphql/dist/metadata/getMetadataStorage';
import { MetadataStorage } from 'type-graphql/dist/metadata/metadata-storage';
import { AdvancedOptions, ReturnTypeFunc } from '../external/type-graphql.types';

export interface FilterableFieldDescriptor<T> {
  propertyName: string;
  type: Type<T>;
  returnTypeFunc?: ReturnTypeFunc;
  advancedOptions?: AdvancedOptions;
}

const typeGraphqlMetadataStorage: () => MetadataStorage = () => getMetadataStorage();

export class GraphQLQueryMetadataStorage {
  readonly filterableObjectStorage: Map<Type<unknown>, FilterableFieldDescriptor<unknown>[]>;

  constructor() {
    this.filterableObjectStorage = new Map();
  }

  addFilterableObjectField<T>(type: Type<T>, field: FilterableFieldDescriptor<unknown>): void {
    let fields = this.filterableObjectStorage.get(type);
    if (!fields) {
      fields = [];
      this.filterableObjectStorage.set(type, fields);
    }
    fields.push(field);
  }

  getFilterableObjectFields<T>(type: Type<T>): FilterableFieldDescriptor<unknown>[] | undefined {
    return this.filterableObjectStorage.get(type);
  }

  getTypeGraphqlObjectMetadata<T>(objType: Type<T>): ObjectClassMetadata | undefined {
    return typeGraphqlMetadataStorage().objectTypes.find(o => o.target === objType);
  }

  clear(): void {
    this.filterableObjectStorage.clear();
  }
}
