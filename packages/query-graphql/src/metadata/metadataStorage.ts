import { Type } from '@nestjs/common';
import { FieldMetadata } from 'type-graphql/dist/metadata/definitions';
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

  getTypeGraphqlFieldsForType<T>(objType: Type<T>): FieldMetadata[] | undefined {
    const typeGraphqlStorage = typeGraphqlMetadataStorage();
    typeGraphqlStorage.build();
    let graphqlObjType = typeGraphqlStorage.objectTypes.find(o => o.target === objType);
    if (!graphqlObjType) {
      graphqlObjType = typeGraphqlStorage.inputTypes.find(o => o.target === objType);
    }
    return graphqlObjType?.fields;
  }

  clear(): void {
    typeGraphqlMetadataStorage().clear();
    this.filterableObjectStorage.clear();
  }
}
