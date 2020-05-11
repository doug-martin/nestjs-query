import { ObjectType, Field } from '@nestjs/graphql';
import { FederationResolver, Relation } from '../../../src';
import * as relations from '../../../src/resolvers/relations';

describe('FederationResolver', () => {
  const readRelation = jest.spyOn(relations, 'ReadRelationsResolver');
  @ObjectType()
  class TestFederatedRelationDTO {
    @Field()
    id!: string;
  }

  it('should create a federated resolver with relations from metadata', () => {
    @ObjectType()
    @Relation('test', () => TestFederatedRelationDTO)
    class TestFederatedDTO {
      @Field()
      id!: string;
    }
    FederationResolver(TestFederatedDTO);
    expect(readRelation).toBeCalledWith(TestFederatedDTO, {
      many: {},
      one: {
        test: { DTO: TestFederatedRelationDTO },
      },
    });
  });

  it('should create a federated resolver with provided relations', () => {
    @ObjectType()
    class TestFederatedDTO {
      @Field()
      id!: string;
    }
    FederationResolver(TestFederatedDTO, {
      one: {
        test: { DTO: TestFederatedRelationDTO },
      },
    });
    expect(readRelation).toBeCalledWith(TestFederatedDTO, {
      many: {},
      one: {
        test: { DTO: TestFederatedRelationDTO },
      },
    });
  });
});
