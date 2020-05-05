import { Class } from '@nestjs-query/core';
import { NoOpQueryService } from '@nestjs-query/core/src/services/noop-query.service';
import { ObjectType } from '@nestjs/graphql';
import { FilterableField } from '../src/decorators';
import { createResolvers } from '../src/providers';
import { CRUDResolver } from '../src/resolvers';

describe('createTypeOrmQueryServiceProviders', () => {
  @ObjectType()
  class TestDTO {
    @FilterableField()
    name!: string;
  }

  it('should create a provider for the entity', () => {
    const providers = createResolvers([{ DTOClass: TestDTO, EntityClass: TestDTO }]);
    expect(providers).toHaveLength(1);
    const Provider = providers[0] as Class<CRUDResolver<TestDTO, TestDTO, TestDTO>>;
    expect(Provider.name).toBe('TestDTOAutoResolver');
    expect(new Provider(NoOpQueryService.getInstance())).toBeInstanceOf(Provider);
  });
});
