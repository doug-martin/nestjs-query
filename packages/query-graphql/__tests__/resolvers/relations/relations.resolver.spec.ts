// eslint-disable-next-line max-classes-per-file
import { Field, ObjectType } from '@nestjs/graphql';
import { PagingStrategies, Relatable, FilterableField, CursorConnection, Reference, Relation } from '../../../src';
import * as readRelations from '../../../src/resolvers/relations/read-relations.resolver';
import * as referenceRelation from '../../../src/resolvers/relations/references-relation.resolver';
import * as removeRelations from '../../../src/resolvers/relations/remove-relations.resolver';
import * as updateRelations from '../../../src/resolvers/relations/update-relations.resolver';
import { BaseServiceResolver } from '../../../src/resolvers/resolver.interface';

describe('Relatable', () => {
  const referenceMixinSpy = jest.spyOn(referenceRelation, 'ReferencesRelationMixin');
  const readMixinSpy = jest.spyOn(readRelations, 'ReadRelationsMixin');
  const updateMixinSpy = jest.spyOn(updateRelations, 'UpdateRelationsMixin');
  const removeMixinSpy = jest.spyOn(removeRelations, 'RemoveRelationsMixin');

  @ObjectType()
  class TestRelation {
    @FilterableField()
    id!: number;
  }

  afterEach(() => jest.clearAllMocks());

  it('should call the mixins with the relations derived from decorators', () => {
    @ObjectType()
    @Relation('testRelation', () => TestRelation)
    @CursorConnection('testConnection', () => TestRelation)
    class Test {}

    Relatable(Test, {})(BaseServiceResolver);

    const relations = {
      one: { testRelation: { DTO: TestRelation, allowFiltering: false } },
      many: { testConnection: { DTO: TestRelation, allowFiltering: false, pagingStrategy: PagingStrategies.CURSOR } },
    };
    expect(readMixinSpy).toHaveBeenCalledWith(Test, relations);
    expect(updateMixinSpy).toHaveBeenCalledWith(Test, relations);
    expect(removeMixinSpy).toHaveBeenCalledWith(Test, relations);
    expect(referenceMixinSpy).toHaveBeenCalledWith(Test, {});
  });

  it('should call the mixins with the references passed in', () => {
    @ObjectType()
    @Reference('testReference', () => TestRelation, { id: 'relationId' })
    class Test {
      @Field()
      relationId!: number;
    }

    Relatable(Test, {})(BaseServiceResolver);

    expect(readMixinSpy).toHaveBeenCalledWith(Test, {});
    expect(updateMixinSpy).toHaveBeenCalledWith(Test, {});
    expect(removeMixinSpy).toHaveBeenCalledWith(Test, {});
    expect(referenceMixinSpy).toHaveBeenCalledWith(Test, {
      testReference: { DTO: TestRelation, keys: { id: 'relationId' } },
    });
  });
});
