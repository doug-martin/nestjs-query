import { FieldMetadata } from 'type-graphql/dist/metadata/definitions';
import { ObjectClassMetadata } from 'type-graphql/dist/metadata/definitions/object-class-metdata';
import { getMetadataStorage } from 'type-graphql/dist/metadata/getMetadataStorage';
import { MetadataStorage } from 'type-graphql/dist/metadata/metadata-storage';
import { Class, DeepPartial, Filter, SortField } from '@nestjs-query/core';
import { AdvancedOptions, ReturnTypeFunc } from '../external/type-graphql.types';
import {
  CreateOneInputType,
  CreateManyInputType,
  UpdateOneInputType,
  UpdateManyInputType,
  DeleteManyInputType,
} from '../types';
import { EdgeType, StaticConnectionType } from '../types/connection';

/**
 * @internal
 */
interface FilterableFieldDescriptor<T> {
  propertyName: string;
  target: Class<T>;
  returnTypeFunc?: ReturnTypeFunc;
  advancedOptions?: AdvancedOptions;
}

/**
 * @internal
 */
const typeGraphqlMetadataStorage: () => MetadataStorage = () => getMetadataStorage();

/**
 * @internal
 */
export class GraphQLQueryMetadataStorage {
  private readonly filterableObjectStorage: Map<Class<unknown>, FilterableFieldDescriptor<unknown>[]>;

  private readonly filterTypeStorage: Map<Class<unknown>, Class<Filter<unknown>>>;

  private readonly sortTypeStorage: Map<Class<unknown>, Class<SortField<unknown>>>;

  private readonly connectionTypeStorage: Map<Class<unknown>, StaticConnectionType<unknown>>;

  private readonly edgeTypeStorage: Map<Class<unknown>, Class<EdgeType<unknown>>>;

  private readonly updateManyInputTypeStorage: Map<
    Class<unknown>,
    Class<UpdateManyInputType<unknown, DeepPartial<unknown>>>
  >;

  private readonly updateOneInputTypeStorage: Map<
    Class<unknown>,
    Class<UpdateOneInputType<unknown, DeepPartial<unknown>>>
  >;

  private readonly deleteManyInputTypeStorage: Map<Class<unknown>, Class<DeleteManyInputType<unknown>>>;

  private readonly createOneInputTypeStorage: Map<
    Class<unknown>,
    Class<CreateOneInputType<unknown, DeepPartial<unknown>>>
  >;

  private readonly createManyInputTypeStorage: Map<
    Class<unknown>,
    Class<CreateManyInputType<unknown, DeepPartial<unknown>>>
  >;

  constructor() {
    this.filterableObjectStorage = new Map();
    this.filterTypeStorage = new Map();
    this.sortTypeStorage = new Map();
    this.connectionTypeStorage = new Map();
    this.edgeTypeStorage = new Map();
    this.updateManyInputTypeStorage = new Map();
    this.updateOneInputTypeStorage = new Map();
    this.deleteManyInputTypeStorage = new Map();
    this.createOneInputTypeStorage = new Map();
    this.createManyInputTypeStorage = new Map();
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
    return this.getValue(this.filterTypeStorage, type);
  }

  addSortType<T>(type: Class<T>, sortType: Class<SortField<T>>): void {
    this.sortTypeStorage.set(type, sortType as Class<SortField<unknown>>);
  }

  getSortType<T>(type: Class<T>): Class<SortField<T>> | undefined {
    return this.getValue(this.sortTypeStorage, type);
  }

  addConnectionType<T>(type: Class<T>, connectionType: StaticConnectionType<T>): void {
    this.connectionTypeStorage.set(type, connectionType);
  }

  getConnectionType<T>(type: Class<T>): StaticConnectionType<T> | undefined {
    return this.getValue(this.connectionTypeStorage, type);
  }

  addEdgeType<T>(type: Class<T>, edgeType: Class<EdgeType<T>>): void {
    this.edgeTypeStorage.set(type, edgeType);
  }

  getEdgeType<T>(type: Class<T>): Class<EdgeType<T>> | undefined {
    return this.getValue(this.edgeTypeStorage, type);
  }

  addCreateOneInputType<DTO, C extends DeepPartial<DTO>>(
    type: Class<DTO>,
    createOneInputType: Class<CreateOneInputType<DTO, C>>,
  ): void {
    this.createOneInputTypeStorage.set(type, createOneInputType);
  }

  getCreateOneInputType<DTO, C extends DeepPartial<DTO>>(
    type: Class<DTO>,
  ): Class<CreateOneInputType<DTO, C>> | undefined {
    return this.getValue(this.createOneInputTypeStorage, type);
  }

  addCreateManyInputType<DTO, C extends DeepPartial<DTO>>(
    type: Class<DTO>,
    createManyInputType: Class<CreateManyInputType<DTO, C>>,
  ): void {
    this.createManyInputTypeStorage.set(type, createManyInputType);
  }

  getCreateManyInputType<DTO, C extends DeepPartial<DTO>>(
    type: Class<DTO>,
  ): Class<CreateManyInputType<DTO, C>> | undefined {
    return this.getValue(this.createManyInputTypeStorage, type);
  }

  addUpdateManyInputType<DTO, U extends DeepPartial<DTO>>(
    type: Class<DTO>,
    updateManyInputType: Class<UpdateManyInputType<DTO, U>>,
  ): void {
    this.updateManyInputTypeStorage.set(type, updateManyInputType);
  }

  getUpdateManyInputType<DTO, U extends DeepPartial<DTO>>(
    type: Class<DTO>,
  ): Class<UpdateManyInputType<DTO, U>> | undefined {
    return this.getValue(this.updateManyInputTypeStorage, type);
  }

  addUpdateOneInputType<DTO, U extends DeepPartial<DTO>>(
    type: Class<DTO>,
    updateOneInputType: Class<UpdateOneInputType<DTO, U>>,
  ): void {
    this.updateOneInputTypeStorage.set(type, updateOneInputType);
  }

  getUpdateOneInputType<DTO, U extends DeepPartial<DTO>>(
    type: Class<DTO>,
  ): Class<UpdateOneInputType<DTO, U>> | undefined {
    return this.getValue(this.updateOneInputTypeStorage, type);
  }

  addDeleteManyInputType<DTO>(type: Class<DTO>, deleteManyInputType: Class<DeleteManyInputType<DTO>>): void {
    this.deleteManyInputTypeStorage.set(type, deleteManyInputType);
  }

  getDeleteManyInputType<DTO>(type: Class<DTO>): Class<DeleteManyInputType<DTO>> | undefined {
    return this.getValue(this.deleteManyInputTypeStorage, type);
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
    this.edgeTypeStorage.clear();
    this.updateManyInputTypeStorage.clear();
    this.updateOneInputTypeStorage.clear();
    this.deleteManyInputTypeStorage.clear();
  }

  private getValue<V>(map: Map<Class<unknown>, Class<unknown>>, key: Class<unknown>): V | undefined {
    const val = map.get(key);
    if (val) {
      return (val as unknown) as V;
    }
    return undefined;
  }
}
