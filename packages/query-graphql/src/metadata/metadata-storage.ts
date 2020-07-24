import { LazyMetadataStorage } from '@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage';
import { ObjectTypeMetadata } from '@nestjs/graphql/dist/schema-builder/metadata/object-type.metadata';
import { EnumMetadata } from '@nestjs/graphql/dist/schema-builder/metadata';
import { AggregateResponse, Class, Filter, SortField } from '@nestjs-query/core';
import { ReturnTypeFunc, FieldOptions, TypeMetadataStorage } from '@nestjs/graphql';
import { ReferencesOpts, RelationsOpts, ResolverRelation, ResolverRelationReference } from '../resolvers/relations';
import { ReferencesKeys } from '../resolvers/relations/relations.interface';
import { EdgeType, StaticConnectionType } from '../types/connection';

/**
 * @internal
 */
export interface FilterableFieldDescriptor<T> {
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

  private readonly filterTypeStorage: Map<string, Class<Filter<unknown>>>;

  private readonly sortTypeStorage: Map<Class<unknown>, Class<SortField<unknown>>>;

  private readonly connectionTypeStorage: Map<string, StaticConnectionType<unknown>>;

  private readonly edgeTypeStorage: Map<Class<unknown>, Class<EdgeType<unknown>>>;

  private readonly relationStorage: Map<Class<unknown>, RelationDescriptor<unknown>[]>;

  private readonly referenceStorage: Map<Class<unknown>, ReferenceDescriptor<unknown, unknown>[]>;

  private readonly aggregateStorage: Map<string, Class<AggregateResponse<unknown>>>;

  constructor() {
    this.filterableObjectStorage = new Map<Class<unknown>, FilterableFieldDescriptor<unknown>[]>();
    this.filterTypeStorage = new Map<string, Class<Filter<unknown>>>();
    this.sortTypeStorage = new Map<Class<unknown>, Class<SortField<unknown>>>();
    this.connectionTypeStorage = new Map<string, StaticConnectionType<unknown>>();
    this.edgeTypeStorage = new Map<Class<unknown>, Class<EdgeType<unknown>>>();
    this.relationStorage = new Map<Class<unknown>, RelationDescriptor<unknown>[]>();
    this.referenceStorage = new Map<Class<unknown>, ReferenceDescriptor<unknown, unknown>[]>();
    this.aggregateStorage = new Map<string, Class<AggregateResponse<unknown>>>();
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

  addFilterType<T>(name: string, filterType: Class<Filter<T>>): void {
    this.filterTypeStorage.set(name, filterType);
  }

  getFilterType<T>(name: string): Class<Filter<T>> | undefined {
    return this.getValue(this.filterTypeStorage, name);
  }

  addSortType<T>(type: Class<T>, sortType: Class<SortField<T>>): void {
    this.sortTypeStorage.set(type, sortType as Class<SortField<unknown>>);
  }

  getSortType<T>(type: Class<T>): Class<SortField<T>> | undefined {
    return this.getValue(this.sortTypeStorage, type);
  }

  addConnectionType<DTO>(
    connectionType: ConnectionTypes,
    connectionName: string,
    staticConnectionType: StaticConnectionType<DTO>,
  ): void {
    this.connectionTypeStorage.set(
      `${connectionType}-${connectionName}`,
      staticConnectionType as StaticConnectionType<unknown>,
    );
  }

  getConnectionType<DTO, SCT extends StaticConnectionType<DTO>>(
    connectionType: ConnectionTypes,
    connectionName: string,
  ): SCT | undefined {
    return this.getValue(this.connectionTypeStorage, `${connectionType}-${connectionName}`);
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

  getRelations<T>(type: Class<T>): RelationsOpts {
    const relationDescriptors = this.getRelationsDescriptors(type);
    return this.convertRelationsToOpts(relationDescriptors);
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

  getReferences<T>(type: Class<T>): ReferencesOpts<T> {
    const descriptors = this.getReferenceDescriptors(type);
    return this.convertReferencesToOpts(descriptors);
  }

  addAggregateResponseType<T>(name: string, agg: Class<AggregateResponse<T>>): void {
    this.aggregateStorage.set(name, agg);
  }

  getAggregateResponseType<T>(name: string): Class<AggregateResponse<T>> | undefined {
    return this.aggregateStorage.get(name);
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

  private getRelationsDescriptors(type: Class<unknown>): RelationDescriptor<unknown>[] {
    const metaRelations = this.relationStorage.get(type) ?? [];
    const relationNames = metaRelations.map((t) => t.name);
    const baseClass = Object.getPrototypeOf(type) as Class<unknown>;
    if (baseClass) {
      const inheritedRelations = this.getRelationsDescriptors(baseClass).filter(
        // filter out duplicates
        (t) => !relationNames.includes(t.name),
      );
      return [...inheritedRelations, ...metaRelations];
    }
    return metaRelations;
  }

  private getReferenceDescriptors<DTO>(type: Class<unknown>): ReferenceDescriptor<DTO, unknown>[] {
    const metaReferences = this.referenceStorage.get(type) ?? [];
    const referenceNames = metaReferences.map((r) => r.name);
    const baseClass = Object.getPrototypeOf(type) as Class<unknown>;
    if (baseClass) {
      const inheritedReferences = this.getReferenceDescriptors(baseClass).filter(
        // filter out duplicates
        (t) => !referenceNames.includes(t.name),
      );
      return [...inheritedReferences, ...metaReferences];
    }
    return metaReferences;
  }

  private convertRelationsToOpts(relations: RelationDescriptor<unknown>[]): RelationsOpts {
    const relationOpts: RelationsOpts = {};
    relations.forEach((r) => {
      const relationType = r.relationTypeFunc();
      const DTO = Array.isArray(relationType) ? relationType[0] : relationType;
      const opts = { ...r.relationOpts, DTO };
      if (r.isMany) {
        relationOpts.many = { ...relationOpts.many, [r.name]: opts };
      } else {
        relationOpts.one = { ...relationOpts.one, [r.name]: opts };
      }
    });
    return relationOpts;
  }

  private convertReferencesToOpts<DTO>(references: ReferenceDescriptor<DTO, unknown>[]): ReferencesOpts<DTO> {
    return references.reduce((referenceOpts, r) => {
      const opts = { ...r.relationOpts, DTO: r.relationTypeFunc(), keys: r.keys };
      return { ...referenceOpts, [r.name]: opts };
    }, {} as ReferencesOpts<DTO>);
  }
}
