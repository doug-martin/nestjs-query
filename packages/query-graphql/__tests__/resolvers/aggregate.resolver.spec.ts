import { AggregateQuery, AggregateResponse } from '@nestjs-query/core';
import { Query, Resolver } from '@nestjs/graphql';
import { when, deepEqual, objectContaining } from 'ts-mockito';
import { AggregateArgsType } from '../../src';
import { AggregateResolver, AggregateResolverOpts } from '../../src/resolvers/aggregate.resolver';
import { expectSDL } from '../__fixtures__';
import {
  createResolverFromNest,
  TestResolverDTO,
  TestService,
  aggregateResolverSDL,
  aggregateDisabledResolverSDL,
} from './__fixtures__';

describe('AggregateResolver', () => {
  const expectResolverSDL = (sdl: string, opts?: AggregateResolverOpts) => {
    @Resolver(() => TestResolverDTO)
    class TestSDLResolver extends AggregateResolver(TestResolverDTO, opts) {
      @Query(() => TestResolverDTO)
      test(): TestResolverDTO {
        return { id: '1', stringField: 'foo' };
      }
    }

    return expectSDL([TestSDLResolver], sdl);
  };

  it('should create a AggregateResolver for the DTO', () => {
    return expectResolverSDL(aggregateResolverSDL, { enabled: true });
  });

  it('should not expose read methods if not enabled', () => {
    return expectResolverSDL(aggregateDisabledResolverSDL);
  });

  describe('#aggregate', () => {
    @Resolver(() => TestResolverDTO)
    class TestResolver extends AggregateResolver(TestResolverDTO, { enabled: true }) {
      constructor(service: TestService) {
        super(service);
      }
    }
    it('should call the service query with the provided input', async () => {
      const { resolver, mockService } = await createResolverFromNest(TestResolver);
      const input: AggregateArgsType<TestResolverDTO> = {
        filter: {
          stringField: { eq: 'foo' },
        },
      };
      const aggregateQuery: AggregateQuery<TestResolverDTO> = { count: ['id'] };
      const output: AggregateResponse<TestResolverDTO> = {
        count: { id: 10 },
      };
      when(mockService.aggregate(objectContaining(input.filter!), deepEqual(aggregateQuery))).thenResolve(output);
      const result = await resolver.aggregate(input, aggregateQuery);
      return expect(result).toEqual(output);
    });
  });
});
