import { ObjectType, Int, Field } from '@nestjs/graphql';
import { FilterableField, Relation, Connection, PagingStrategies, Reference } from '../../src';
import { getMetadataStorage } from '../../src/metadata';

describe('GraphQLQueryMetadataStorage', () => {
  @ObjectType()
  class SomeRelation {}

  @ObjectType()
  class SomeReference {
    @Field()
    id!: number;
  }

  @ObjectType({ isAbstract: true })
  @Relation('test', () => SomeRelation)
  @Relation('tests', () => [SomeRelation])
  @Connection('testConnection', () => SomeRelation)
  @Reference('testReference', () => SomeReference, { id: 'referenceId' })
  class BaseType {
    @FilterableField(() => Int)
    id!: number;

    @Field()
    referenceId!: number;
  }

  @ObjectType()
  @Relation('implementedRelation', () => SomeRelation)
  @Relation('implementedRelations', () => [SomeRelation])
  @Connection('implementedConnection', () => SomeRelation)
  @Reference('implementedReference', () => SomeReference, { id: 'referenceId' })
  class ImplementingClass extends BaseType {
    @FilterableField()
    implemented!: boolean;
  }

  @ObjectType()
  @Relation('implementedRelation', () => SomeRelation, { relationName: 'test' })
  @Relation('implementedRelations', () => [SomeRelation], { relationName: 'tests' })
  @Connection('implementedConnection', () => SomeRelation, { relationName: 'testConnection' })
  @Reference('implementedReference', () => SomeReference, { id: 'someReferenceId' })
  class DuplicateImplementor extends ImplementingClass {
    @FilterableField({ name: 'test' })
    id!: number;

    @Field()
    someReferenceId!: number;
  }

  const metadataStorage = getMetadataStorage();

  describe('getFilterableObjectFields', () => {
    it('should return filterable fields for a type', () => {
      expect(metadataStorage.getFilterableObjectFields(BaseType)).toEqual([
        { propertyName: 'id', target: Number, returnTypeFunc: expect.any(Function) },
      ]);
    });

    it('should return inherited filterable fields for a type', () => {
      expect(metadataStorage.getFilterableObjectFields(ImplementingClass)).toEqual([
        { propertyName: 'id', target: Number, returnTypeFunc: expect.any(Function) },
        { propertyName: 'implemented', target: Boolean },
      ]);
    });

    it('should exclude duplicate fields inherited filterable fields for a type', () => {
      expect(metadataStorage.getFilterableObjectFields(DuplicateImplementor)).toEqual([
        { propertyName: 'implemented', target: Boolean },
        { propertyName: 'id', target: Number, advancedOptions: { name: 'test' } },
      ]);
    });
  });

  describe('getRelations', () => {
    it('should return relations for a type', () => {
      expect(metadataStorage.getRelations(BaseType)).toEqual({
        one: {
          test: { DTO: SomeRelation },
        },
        many: {
          tests: { DTO: SomeRelation, pagingStrategy: 'offset' },
          testConnection: { DTO: SomeRelation, pagingStrategy: 'cursor' },
        },
      });
    });

    it('should return inherited relations fields for a type', () => {
      expect(metadataStorage.getRelations(ImplementingClass)).toEqual({
        one: {
          test: { DTO: SomeRelation },
          implementedRelation: { DTO: SomeRelation },
        },
        many: {
          tests: { DTO: SomeRelation, pagingStrategy: PagingStrategies.OFFSET },
          testConnection: { DTO: SomeRelation, pagingStrategy: PagingStrategies.CURSOR },
          implementedRelations: { DTO: SomeRelation, pagingStrategy: PagingStrategies.OFFSET },
          implementedConnection: { DTO: SomeRelation, pagingStrategy: PagingStrategies.CURSOR },
        },
      });
    });

    it('should exclude duplicate inherited relations fields for a type', () => {
      expect(metadataStorage.getRelations(DuplicateImplementor)).toEqual({
        one: {
          test: { DTO: SomeRelation },
          implementedRelation: { DTO: SomeRelation, relationName: 'test' },
        },
        many: {
          tests: { DTO: SomeRelation, pagingStrategy: PagingStrategies.OFFSET },
          testConnection: { DTO: SomeRelation, pagingStrategy: PagingStrategies.CURSOR },
          implementedRelations: { DTO: SomeRelation, pagingStrategy: PagingStrategies.OFFSET, relationName: 'tests' },
          implementedConnection: {
            DTO: SomeRelation,
            pagingStrategy: PagingStrategies.CURSOR,
            relationName: 'testConnection',
          },
        },
      });
    });
  });

  describe('getReferences', () => {
    it('should return references for a type', () => {
      expect(metadataStorage.getReferences(BaseType)).toEqual({
        testReference: { DTO: SomeReference, keys: { id: 'referenceId' } },
      });
    });

    it('should return inherited references fields for a type', () => {
      expect(metadataStorage.getReferences(ImplementingClass)).toEqual({
        testReference: { DTO: SomeReference, keys: { id: 'referenceId' } },
        implementedReference: { DTO: SomeReference, keys: { id: 'referenceId' } },
      });
    });

    it('should exclude duplicate inherited references fields for a type', () => {
      expect(metadataStorage.getReferences(DuplicateImplementor)).toEqual({
        testReference: { DTO: SomeReference, keys: { id: 'referenceId' } },
        implementedReference: { DTO: SomeReference, keys: { id: 'someReferenceId' } },
      });
    });
  });
});
