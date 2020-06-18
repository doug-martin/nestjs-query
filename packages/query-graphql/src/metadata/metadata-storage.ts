import { TypeMetadataStorage } from '@nestjs/graphql/dist/schema-builder/storages/type-metadata.storage';
import { LazyMetadataStorage } from '@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage';
import { Class, Filter, SortField } from '@nestjs-query/core';
import { ObjectTypeMetadata } from '@nestjs/graphql/dist/schema-builder/metadata/object-type.metadata';
import { ReturnTypeFunc, FieldOptions } from '@nestjs/graphql';
import { EnumMetadata } from '@nestjs/graphql/dist/schema-builder/metadata';
import { ResolverRelation, ResolverRelationReference } from '../resolvers/relations';
import { ReferencesKeys } from '../resolvers/relations/relations.interface';
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
  relationTypeFunc: () => Class<Relation> | Class<Relation>[];
  isMany: boolean;
  relationOpts?: Omit<ResolverRelation<Relation>, 'DTO'>;
}

interface ReferenceDescriptor<DTO, Reference> {
  name: string;
  keys: ReferencesKeys<DTO, Reference>;
  relationTypeFunc: () => Class<Reference>;
  relationOpts?: Omit<ResolverRelationReference<DTO, Reference>, 'DTO'>;
}

type ConnectionTypes = 'cursor' | 'array';

/**
 * @internal
 */
export class GraphQLQueryMetadataStorage {
  private readonly filterableObjectStorage: Map<Class<unknown>, FilterableFieldDescriptor<unknown>[]>;

  private readonly filterTypeStorage: Map<Class<unknown>, Class<Filter<unknown>>>;

  private readonly sortTypeStorage: Map<Class<unknown>, Class<SortField<unknown>>>;

  private readonly connectionTypeStorage: Map<string, StaticConnectionType<unknown>>;

  private readonly edgeTypeStorage: Map<Class<unknown>, Class<EdgeType<unknown>>>;

  private readonly relationStorage: Map<Class<unknown>, RelationDescriptor<unknown>[]>;

  private readonly referenceStorage: Map<Class<unknown>, ReferenceDescriptor<unknown, unknown>[]>;

  constructor() {
    this.filterableObjectStorage = new Map<Class<unknown>, FilterableFieldDescriptor<unknown>[]>();
    this.filterTypeStorage = new Map<Class<unknown>, Class<Filter<unknown>>>();
    this.sortTypeStorage = new Map<Class<unknown>, Class<SortField<unknown>>>();
    this.connectionTypeStorage = new Map<string, StaticConnectionType<unknown>>();
    this.edgeTypeStorage = new Map<Class<unknown>, Class<EdgeType<unknown>>>();
    this.relationStorage = new Map<Class<unknown>, RelationDescriptor<unknown>[]>();
    this.referenceStorage = new Map<Class<unknown>, ReferenceDescriptor<unknown, unknown>[]>();
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
    const baseClass = Object.getPrototypeOf(type) as Class<unknown>;
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

  addConnectionType<DTO, SCT extends StaticConnectionType<DTO>>(
    connectionType: ConnectionTypes,
    type: Class<DTO>,
    staticConnectionType: SCT,
  ): void {
    this.connectionTypeStorage.set(
      `${connectionType}-${type.name}`,
      staticConnectionType as StaticConnectionType<unknown>,
    );
  }

  getConnectionType<DTO, SCT extends StaticConnectionType<DTO>>(
    connectionType: ConnectionTypes,
    type: Class<DTO>,
  ): SCT | undefined {
    return this.getValue(this.connectionTypeStorage, `${connectionType}-${type.name}`);
  }

  addEdgeType<T>(type: Class<T>, edgeType: Class<EdgeType<T>>): void {
    this.edgeTypeStorage.set(type, edgeType);
  }

  getEdgeType<T>(type: Class<T>): Class<EdgeType<T>> | undefined {
    return this.getValue(this.edgeTypeStorage, type);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addRelation<T>(type: Class<T>, name: string, relation: RelationDescriptor<any>): void {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addReference<T>(type: Class<T>, name: string, reference: ReferenceDescriptor<T, any>): void {
    let references: ReferenceDescriptor<unknown, unknown>[] | undefined = this.referenceStorage.get(type);
    if (!references) {
      references = [];
      this.referenceStorage.set(type, references);
    }
    references.push(reference as ReferenceDescriptor<unknown, unknown>);
  }

  getReferences<T>(type: Class<T>): ReferenceDescriptor<T, unknown>[] | undefined {
    return this.referenceStorage.get(type);
  }

  getGraphqlObjectMetadata<T>(objType: Class<T>): ObjectTypeMetadata | undefined {
    return TypeMetadataStorage.getObjectTypesMetadata().find((o) => o.target === objType);
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  getGraphqlEnumMetadata<T>(objType: object): EnumMetadata | undefined {
    // hack to get enums loaded it may break in the future :(
    LazyMetadataStorage.load();
    return TypeMetadataStorage.getEnumsMetadata().find((o) => o.ref === objType);
  }

  clear(): void {
    TypeMetadataStorage.clear();
    this.filterableObjectStorage.clear();
    this.filterTypeStorage.clear();
    this.sortTypeStorage.clear();
    this.connectionTypeStorage.clear();
    this.edgeTypeStorage.clear();
    this.relationStorage.clear();
    this.referenceStorage.clear();
  }

  private getValue<V>(map: Map<unknown, Class<unknown>>, key: unknown): V | undefined {
    const val = map.get(key);
    if (val) {
      return (val as unknown) as V;
    }
    return undefined;
  }
}
