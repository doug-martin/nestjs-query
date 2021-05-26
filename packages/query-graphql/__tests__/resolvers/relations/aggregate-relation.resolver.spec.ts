import { Query, Resolver } from '@nestjs/graphql';
import { deepEqual, objectContaining, when } from 'ts-mockito';
import { AggregateQuery, AggregateResponse, Filter } from '@nestjs-query/core';
import { AggregateRelationsResolver } from '../../../src/resolvers/relations';
import { AggregateRelationsResolverOpts } from '../../../src/resolvers/relations/aggregate-relations.resolver';
import {
  generateSchema,
  createResolverFromNest,
  TestResolverDTO,
  TestService,
  TestRelationDTO,
} from '../../__fixtures__';

describe('AggregateRelationsResolver', () => {
  const expectResolverSDL = async (opts?: AggregateRelationsResolverOpts) => {
    @Resolver(() => TestResolverDTO)
    class TestSDLResolver extends AggregateRelationsResolver(TestResolverDTO, opts ?? {}) {
      @Query(() => TestResolverDTO)
      test(): TestResolverDTO {
        return { id: '1', stringField: 'foo' };
      }
    }

    const schema = await generateSchema([TestSDLResolver]);
    expect(schema).toMatchSnapshot();
  };

  it('should not add read methods if one and many are empty', () => expectResolverSDL());
  describe('aggregate', () => {
    it('should use the object type name', () =>
      expectResolverSDL({ enableAggregate: true, many: { relations: { DTO: TestRelationDTO } } }));

    it('should use the dtoName if provided', () =>
      expectResolverSDL({ enableAggregate: true, many: { relations: { DTO: TestRelationDTO, dtoName: 'Test' } } }));

    it('should not add read methods if enableAggregate is not true', () =>
      expectResolverSDL({ many: { relations: { DTO: TestRelationDTO, disableRead: true } } }));

    describe('aggregate query', () => {
      it('should call the service aggregateRelations with the provided dto', async () => {
        @Resolver(() => TestResolverDTO)
        class TestResolver extends AggregateRelationsResolver(TestResolverDTO, {
          enableAggregate: true,
          one: { relation: { DTO: TestRelationDTO }, custom: { DTO: TestRelationDTO, relationName: 'other' } },
          many: { relations: { DTO: TestRelationDTO }, customs: { DTO: TestRelationDTO, relationName: 'others' } },
        }) {
          constructor(service: TestService) {
            super(service);
          }
        }

        const { resolver, mockService } = await createResolverFromNest(TestResolver);
        const dto: TestResolverDTO = {
          id: 'id-1',
          stringField: 'foo',
        };
        const filter: Filter<TestRelationDTO> = { id: { eq: 'id-2' } };
        const aggregateQuery: AggregateQuery<TestRelationDTO> = {
          count: ['id'],
          sum: ['testResolverId'],
        };
        const output: AggregateResponse<TestRelationDTO>[] = [
          {
            count: { id: 10 },
            sum: { testResolverId: 100 },
          },
        ];
        when(
          mockService.aggregateRelations(
            TestRelationDTO,
            'relations',
            deepEqual([dto]),
            objectContaining(filter),
            objectContaining(aggregateQuery),
          ),
        ).thenResolve(new Map([[dto, output]]));
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const result = await resolver.aggregateRelations(dto, { filter }, aggregateQuery, {});
        return expect(result).toEqual(output);
      });
    });
  });
});
