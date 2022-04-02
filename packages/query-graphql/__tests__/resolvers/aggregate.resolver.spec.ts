import { AggregateQuery, AggregateResponse } from '@nestjs-query/core';
import { Query, Resolver } from '@nestjs/graphql';
import { deepEqual, objectContaining, when } from 'ts-mockito';
import { AggregateArgsType } from '../../src';
import { AggregateResolver, AggregateResolverOpts } from '../../src/resolvers/aggregate.resolver';
import { createResolverFromNest, generateSchema, TestResolverDTO, TestService } from '../__fixtures__';

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
    return schema;
  };

  it('should create a AggregateResolver for the DTO', () => expectResolverSDL({ enabled: true }));

  it('should not expose read methods if not enabled', async () => {
    const schema = await expectResolverSDL();
    // It should not generate inputs
    expect(schema).not.toContain('input');
    // It should only generate 2 types (TestResolverDTO and Query)
    const typeOccurrences = (schema.match(/type/g) || []).length;
    expect(typeOccurrences).toBe(2);
  });

  describe('#aggregate', () => {
    const createResolver = () => {
      @Resolver(() => TestResolverDTO)
      class TestResolver extends AggregateResolver(TestResolverDTO, { enabled: true }) {
        constructor(service: TestService) {
          super(service);
        }
      }
      return TestResolver;
    };

    it('should call the service query with the provided input', async () => {
      const { resolver, mockService } = await createResolverFromNest(createResolver());
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
