import { ObjectType, Int } from '@nestjs/graphql';
import { FilterableField } from '../../src/decorators/filterable-field.decorator';
import { getMetadataStorage } from '../../src/metadata';

describe('GraphQLQueryMetadataStorage', () => {
  @ObjectType({ isAbstract: true })
  class BaseType {
    @FilterableField(() => Int)
    id!: number;
  }

  @ObjectType()
  class ImplementingClass extends BaseType {
    @FilterableField()
    implemented!: boolean;
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
      @ObjectType()
      class DuplicateImplementor extends ImplementingClass {
        @FilterableField({ name: 'test' })
        id!: number;
      }
      expect(metadataStorage.getFilterableObjectFields(DuplicateImplementor)).toEqual([
        { propertyName: 'implemented', target: Boolean },
        { propertyName: 'id', target: Number, advancedOptions: { name: 'test' } },
      ]);
    });
  });
});
