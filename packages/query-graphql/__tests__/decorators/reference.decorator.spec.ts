import { ObjectType, Int, Field } from '@nestjs/graphql';
import { FilterableField, Reference } from '../../src';
import { getReferences } from '../../src/decorators/reference.decorator';

describe('@Reference decorator', () => {
  @ObjectType()
  class SomeReference {
    @Field()
    id!: number;
  }

  @ObjectType({ isAbstract: true })
  @Reference('testReference', () => SomeReference, { id: 'referenceId' })
  class BaseType {
    @FilterableField(() => Int)
    id!: number;

    @Field()
    referenceId!: number;
  }

  @ObjectType()
  @Reference('implementedReference', () => SomeReference, { id: 'referenceId' })
  class ImplementingClass extends BaseType {
    @FilterableField()
    implemented!: boolean;
  }

  @ObjectType()
  @Reference('implementedReference', () => SomeReference, { id: 'someReferenceId' })
  class DuplicateImplementor extends ImplementingClass {
    @FilterableField({ name: 'test' })
    id!: number;

    @Field()
    someReferenceId!: number;
  }

  describe('getReferences', () => {
    it('should return references for a type', () => {
      expect(getReferences(BaseType)).toEqual({
        testReference: { DTO: SomeReference, keys: { id: 'referenceId' } },
      });
    });

    it('should return inherited references fields for a type', () => {
      expect(getReferences(ImplementingClass)).toEqual({
        testReference: { DTO: SomeReference, keys: { id: 'referenceId' } },
        implementedReference: { DTO: SomeReference, keys: { id: 'referenceId' } },
      });
    });

    it('should exclude duplicate inherited references fields for a type', () => {
      expect(getReferences(DuplicateImplementor)).toEqual({
        testReference: { DTO: SomeReference, keys: { id: 'referenceId' } },
        implementedReference: { DTO: SomeReference, keys: { id: 'someReferenceId' } },
      });
    });
  });
});
