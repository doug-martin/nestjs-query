import { AggregateQuery, AggregateResponse } from '@nestjs-query/core';
import { Query, Resolver } from '@nestjs/graphql';
import { when, deepEqual, objectContaining } from 'ts-mockito';
import { AggregateArgsType } from '../../src';
import { AggregateResolver, AggregateResolverOpts } from '../../src/resolvers/aggregate.resolver';
import { generateSchema, createResolverFromNest, TestResolverDTO, TestService } from '../__fixtures__';

describe('AggregateResolver', () => {
  const expectResolverSDL = async (opts?: AggregateResolverOpts) => {
    @Resolver(() => TestResolverDTO)
    class TestSDLResolver extends AggregateResolver(TestResolverDTO, opts) {
      @Query(() => TestResolverDTO)
      test(): TestResolverDTO {
        return { id: '1', stringField: 'foo' };
      }
    }
    const schema = await generateSchema([TestSDLResolver]);
    expect(schema).toMatchSnapshot();
  };

  it('should create a AggregateResolver for the DTO', () => expectResolverSDL({ enabled: true }));

  it('should not expose read methods if not enabled', () => expectResolverSDL());

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
      const output: AggregateResponse<TestResolverDTO>[] = [
        {
          count: { id: 10 },
        },
      ];
      when(mockService.aggregate(objectContaining(input.filter!), deepEqual(aggregateQuery))).thenResolve(output);
      const result = await resolver.aggregate(input, aggregateQuery);
      return expect(result).toEqual(output);
    });
  });
});
