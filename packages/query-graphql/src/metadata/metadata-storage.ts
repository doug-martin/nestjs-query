import { FieldMetadata } from 'type-graphql/dist/metadata/definitions';
import { ObjectClassMetadata } from 'type-graphql/dist/metadata/definitions/object-class-metdata';
import { getMetadataStorage } from 'type-graphql/dist/metadata/getMetadataStorage';
import { MetadataStorage } from 'type-graphql/dist/metadata/metadata-storage';
import { Class, Filter, SortField } from '@nestjs-query/core';
import { AdvancedOptions, ReturnTypeFunc } from '../external/type-graphql.types';
import { EdgeType, StaticConnectionType } from '../types/connection';

export interface FilterableFieldDescriptor<T> {
  propertyName: string;
  type: Class<T>;
  returnTypeFunc?: ReturnTypeFunc;
  advancedOptions?: AdvancedOptions;
}

const typeGraphqlMetadataStorage: () => MetadataStorage = () => getMetadataStorage();

export class GraphQLQueryMetadataStorage {
  private readonly filterableObjectStorage: Map<Class<unknown>, FilterableFieldDescriptor<unknown>[]>;

  private readonly filterTypeStorage: Map<Class<unknown>, Class<Filter<unknown>>>;

  private readonly sortTypeStorage: Map<Class<unknown>, Class<SortField<unknown>>>;

  private readonly connectionTypeStorage: Map<Class<unknown>, StaticConnectionType<unknown>>;

  private readonly edgeTypeStorage: Map<Class<unknown>, Class<EdgeType<unknown>>>;

  constructor() {
    this.filterableObjectStorage = new Map();
    this.filterTypeStorage = new Map();
    this.sortTypeStorage = new Map();
    this.connectionTypeStorage = new Map();
    this.edgeTypeStorage = new Map();
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

  addFilterType<T>(type: Class<T>, filterType: Class<Filter<T>>): void {
    this.filterTypeStorage.set(type, filterType);
  }

  getFilterType<T>(type: Class<T>): Class<Filter<T>> | undefined {
    return this.filterTypeStorage.get(type);
  }

  addSortType<T>(type: Class<T>, sortType: Class<SortField<T>>): void {
    this.sortTypeStorage.set(type, sortType as Class<SortField<unknown>>);
  }

  getSortType<T>(type: Class<T>): Class<SortField<T>> | undefined {
    return this.sortTypeStorage.get(type);
  }

  addConnectionType<T>(type: Class<T>, connectionType: StaticConnectionType<T>): void {
    this.connectionTypeStorage.set(type, connectionType);
  }

  getConnectionType<T>(type: Class<T>): StaticConnectionType<T> | undefined {
    const connectionType = this.connectionTypeStorage.get(type);
    if (connectionType) {
      return (connectionType as unknown) as StaticConnectionType<T>;
    }
    return undefined;
  }

  addEdgeType<T>(type: Class<T>, edgeType: Class<EdgeType<T>>): void {
    this.edgeTypeStorage.set(type, edgeType);
  }

  getEdgeType<T>(type: Class<T>): Class<EdgeType<T>> | undefined {
    const edgeType = this.edgeTypeStorage.get(type);
    if (edgeType) {
      return (edgeType as unknown) as Class<EdgeType<T>>;
    }
    return undefined;
  }

  getTypeGraphqlObjectMetadata<T>(objType: Class<T>): ObjectClassMetadata | undefined {
    return typeGraphqlMetadataStorage().objectTypes.find(o => o.target === objType);
  }

  getTypeGraphqlFieldsForType<T>(objType: Class<T>): FieldMetadata[] | undefined {
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
    this.filterTypeStorage.clear();
    this.sortTypeStorage.clear();
    this.connectionTypeStorage.clear();
  }
}
