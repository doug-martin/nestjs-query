import { TypeMetadataStorage } from '@nestjs/graphql/dist/schema-builder/storages/type-metadata.storage';
import { Class, Filter, SortField } from '@nestjs-query/core';
import { ObjectTypeMetadata } from '@nestjs/graphql/dist/schema-builder/metadata/object-type.metadata';
import { ReturnTypeFunc, FieldOptions } from '@nestjs/graphql';
import { ResolverRelation } from '../resolvers/relations';
import { EdgeType, StaticConnectionType } from '../types/connection';

/**
 * @internal
 */
interface FilterableFieldDescriptor<T> {
  propertyName: string;
  target: Class<T>;
  returnTypeFunc?: ReturnTypeFunc;
  advancedOptions?: FieldOptions;
}

interface RelationDescriptor<Relation> {
  name: string;
  relationTypeFunc: () => Class<Relation>;
  isConnection: boolean;
  relationOpts?: Omit<ResolverRelation<Relation>, 'DTO'>;
}
/**
 * @internal
 */
export class GraphQLQueryMetadataStorage {
  private readonly filterableObjectStorage: Map<Class<unknown>, FilterableFieldDescriptor<unknown>[]>;

  private readonly filterTypeStorage: Map<Class<unknown>, Class<Filter<unknown>>>;

  private readonly sortTypeStorage: Map<Class<unknown>, Class<SortField<unknown>>>;

  private readonly connectionTypeStorage: Map<Class<unknown>, StaticConnectionType<unknown>>;

  private readonly edgeTypeStorage: Map<Class<unknown>, Class<EdgeType<unknown>>>;

  private readonly relationStorage: Map<Class<unknown>, RelationDescriptor<unknown>[]>;

  constructor() {
    this.filterableObjectStorage = new Map();
    this.filterTypeStorage = new Map();
    this.sortTypeStorage = new Map();
    this.connectionTypeStorage = new Map();
    this.edgeTypeStorage = new Map();
    this.relationStorage = new Map();
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
    const typeFields = this.filterableObjectStorage.get(type) ?? [];
    const fieldNames = typeFields.map((t) => t.propertyName);
    const baseClass = Object.getPrototypeOf(type);
    if (baseClass) {
      const inheritedFields = (this.getFilterableObjectFields(baseClass) ?? []).filter(
        (t) => !fieldNames.includes(t.propertyName),
      );
      if (typeFields.length === 0 && inheritedFields.length === 0) {
        return undefined;
      }
      return [...inheritedFields, ...typeFields];
    }
    return typeFields;
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
    this.connectionTypeStorage.set(type, connectionType as StaticConnectionType<unknown>);
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

  addRelation<T>(type: Class<T>, name: string, relation: RelationDescriptor<unknown>): void {
    let relations: RelationDescriptor<unknown>[] | undefined = this.relationStorage.get(type);
    if (!relations) {
      relations = [];
      this.relationStorage.set(type, relations);
    }
    relations.push(relation);
  }

  getRelations<T>(type: Class<T>): RelationDescriptor<unknown>[] | undefined {
    return this.relationStorage.get(type);
  }

  getGraphqlObjectMetadata<T>(objType: Class<T>): ObjectTypeMetadata | undefined {
    return TypeMetadataStorage.getObjectTypesMetadata().find((o) => o.target === objType);
  }

  clear(): void {
    TypeMetadataStorage.clear();
    this.filterableObjectStorage.clear();
    this.filterTypeStorage.clear();
    this.sortTypeStorage.clear();
    this.connectionTypeStorage.clear();
    this.edgeTypeStorage.clear();
    this.relationStorage.clear();
  }

  private getValue<V>(map: Map<Class<unknown>, Class<unknown>>, key: Class<unknown>): V | undefined {
    const val = map.get(key);
    if (val) {
      return (val as unknown) as V;
    }
    return undefined;
  }
}
