// eslint-disable-next-line max-classes-per-file
import { Field, ObjectType } from '@nestjs/graphql';
import { PagingStrategies, ReferencesOpts, Relatable } from '../../../src';
import { Connection, Reference, Relation } from '../../../src/decorators';
import { FilterableField } from '../../../src/decorators/filterable-field.decorator';
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
    @Connection('testConnection', () => TestRelation)
    class Test {}

    Relatable(Test, { relations: {}, references: {} })(BaseServiceResolver);

    const relations = {
      one: { testRelation: { DTO: TestRelation } },
      many: { testConnection: { DTO: TestRelation, pagingStrategy: PagingStrategies.CURSOR } },
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

    Relatable(Test, { relations, references: {} })(BaseServiceResolver);

    expect(readMixinSpy).toHaveBeenCalledWith(Test, relations);
    expect(updateMixinSpy).toHaveBeenCalledWith(Test, relations);
    expect(removeMixinSpy).toHaveBeenCalledWith(Test, relations);
    expect(referenceMixinSpy).toHaveBeenCalledWith(Test, {});
  });

  it('should call the mixins with the relations and the correct pagingStrategy', () => {
    const relations = {
      one: { testRelation: { DTO: TestRelation } },
      many: { testConnection: { DTO: TestRelation } },
    };

    @ObjectType()
    class Test {}

    Relatable(Test, { pagingStrategy: PagingStrategies.OFFSET, relations, references: {} })(BaseServiceResolver);

    expect(readMixinSpy).toHaveBeenCalledWith(Test, { ...relations, pagingStrategy: PagingStrategies.OFFSET });
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

    Relatable(Test, { relations: {}, references: {} })(BaseServiceResolver);

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
    Relatable(Test, { relations: {}, references })(BaseServiceResolver);

    expect(readMixinSpy).toHaveBeenCalledWith(Test, relations);
    expect(updateMixinSpy).toHaveBeenCalledWith(Test, relations);
    expect(removeMixinSpy).toHaveBeenCalledWith(Test, relations);
    expect(referenceMixinSpy).toHaveBeenCalledWith(Test, references);
  });
});
