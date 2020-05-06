import { ObjectType } from '@nestjs/graphql';
import { Connection, Relation } from '../../../src/decorators';
import { FilterableField } from '../../../src/decorators/filterable-field.decorator';
import * as readRelations from '../../../src/resolvers/relations/read-relations.resolver';
import * as updateRelations from '../../../src/resolvers/relations/update-relations.resolver';
import * as removeRelations from '../../../src/resolvers/relations/remove-relations.resolver';
import { Relatable } from '../../../src';
import { BaseServiceResolver } from '../../../src/resolvers/resolver.interface';

describe('Relatable', () => {
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
    expect(readMixinSpy).toBeCalledWith(Test, relations);
    expect(updateMixinSpy).toBeCalledWith(Test, relations);
    expect(removeMixinSpy).toBeCalledWith(Test, relations);
  });

  it('should call the mixins with the relations that are passed in', () => {
    @ObjectType()
    class Test {}

    Relatable(
      Test,
      {
        one: { testRelation: { DTO: TestRelation } },
        many: { testConnection: { DTO: TestRelation } },
      },
      {},
    )(BaseServiceResolver);

    const relations = {
      one: { testRelation: { DTO: TestRelation } },
      many: { testConnection: { DTO: TestRelation } },
    };
    expect(readMixinSpy).toBeCalledWith(Test, relations);
    expect(updateMixinSpy).toBeCalledWith(Test, relations);
    expect(removeMixinSpy).toBeCalledWith(Test, relations);
  });
});
