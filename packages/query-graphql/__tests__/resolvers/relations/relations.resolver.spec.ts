import { ObjectType, Field } from '@nestjs/graphql';
import { Connection, Reference, Relation } from '../../../src/decorators';
import { FilterableField } from '../../../src/decorators/filterable-field.decorator';
import * as referenceRelation from '../../../src/resolvers/relations/references-relation.resolver';
import * as readRelations from '../../../src/resolvers/relations/read-relations.resolver';
import * as updateRelations from '../../../src/resolvers/relations/update-relations.resolver';
import * as removeRelations from '../../../src/resolvers/relations/remove-relations.resolver';
import { ReferencesOpts, Relatable } from '../../../src';
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
    @Connection('testConnection', () => TestRelation)
    class Test {}

    Relatable(Test, {}, {})(BaseServiceResolver);

    const relations = {
      one: { testRelation: { DTO: TestRelation } },
      many: { testConnection: { DTO: TestRelation } },
    };
    expect(readMixinSpy).toHaveBeenCalledWith(Test, relations);
    expect(updateMixinSpy).toHaveBeenCalledWith(Test, relations);
    expect(removeMixinSpy).toHaveBeenCalledWith(Test, relations);
    expect(referenceMixinSpy).toHaveBeenCalledWith(Test, {});
  });

  it('should call the mixins with the relations that are passed in', () => {
    const relations = {
      one: { testRelation: { DTO: TestRelation } },
      many: { testConnection: { DTO: TestRelation } },
    };

    @ObjectType()
    class Test {}

    Relatable(Test, relations, {})(BaseServiceResolver);

    expect(readMixinSpy).toHaveBeenCalledWith(Test, relations);
    expect(updateMixinSpy).toHaveBeenCalledWith(Test, relations);
    expect(removeMixinSpy).toHaveBeenCalledWith(Test, relations);
    expect(referenceMixinSpy).toHaveBeenCalledWith(Test, {});
  });

  it('should call the mixins with the references derived from decorators', () => {
    @ObjectType()
    @Reference('testRelation', () => TestRelation, { id: 'relationId' })
    @Reference('testRelation2', () => TestRelation, { id: 'relationId' })
    class Test {
      @Field()
      relationId!: number;
    }

    Relatable(Test, {}, {})(BaseServiceResolver);

    const references = {
      testRelation: { DTO: TestRelation, keys: { id: 'relationId' } },
      testRelation2: { DTO: TestRelation, keys: { id: 'relationId' } },
    };
    const relations = { many: {}, one: {} };
    expect(readMixinSpy).toHaveBeenCalledWith(Test, relations);
    expect(updateMixinSpy).toHaveBeenCalledWith(Test, relations);
    expect(removeMixinSpy).toHaveBeenCalledWith(Test, relations);
    expect(referenceMixinSpy).toHaveBeenCalledWith(Test, references);
  });

  it('should call the mixins with the references passed in', () => {
    @ObjectType()
    class Test {
      @Field()
      relationId!: number;
    }

    const references: ReferencesOpts<Test> = {
      testRelation: { DTO: TestRelation, keys: { id: 'relationId' } },
    };
    const relations = { many: {}, one: {} };
    Relatable(Test, {}, references)(BaseServiceResolver);

    expect(readMixinSpy).toHaveBeenCalledWith(Test, relations);
    expect(updateMixinSpy).toHaveBeenCalledWith(Test, relations);
    expect(removeMixinSpy).toHaveBeenCalledWith(Test, relations);
    expect(referenceMixinSpy).toHaveBeenCalledWith(Test, references);
  });
});
