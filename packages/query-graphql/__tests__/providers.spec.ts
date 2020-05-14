import { Class, NoOpQueryService } from '@nestjs-query/core';
import { ObjectType } from '@nestjs/graphql';
import { FilterableField } from '../src/decorators';
import { createResolvers } from '../src/providers';
import { CRUDResolver } from '../src/resolvers';
import { ServiceResolver } from '../src/resolvers/resolver.interface';

describe('createTypeOrmQueryServiceProviders', () => {
  @ObjectType()
  class TestDTO {
    @FilterableField()
    name!: string;
  }

  describe('entity crud resolver', () => {
    it('should create a provider for the entity', () => {
      const providers = createResolvers([{ DTOClass: TestDTO, EntityClass: TestDTO }]);
      expect(providers).toHaveLength(1);
      const Provider = providers[0] as Class<CRUDResolver<TestDTO, TestDTO, TestDTO>>;
      expect(Provider.name).toBe('TestDTOAutoResolver');
      expect(new Provider(NoOpQueryService.getInstance())).toBeInstanceOf(Provider);
    });

    it('should create a federated provider for the entity', () => {
      class Service extends NoOpQueryService<TestDTO> {}

      const providers = createResolvers([{ type: 'federated', DTOClass: TestDTO, Service }]);
      expect(providers).toHaveLength(1);
      const Provider = providers[0] as Class<ServiceResolver<TestDTO>>;
      expect(Provider.name).toBe('TestDTOFederatedAutoResolver');
      expect(new Provider(NoOpQueryService.getInstance())).toBeInstanceOf(Provider);
    });
  });
});
