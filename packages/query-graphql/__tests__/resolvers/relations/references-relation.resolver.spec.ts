import { Resolver, Query } from '@nestjs/graphql';
import { ReferencesOpts, ReferencesRelationsResolver } from '../../../src/resolvers/relations';
import { expectSDL } from '../../__fixtures__';
import { createResolverFromNest, TestResolverDTO, TestService } from '../__fixtures__';
import {
  referenceRelationEmptySDL,
  referenceRelationNullableSDL,
  referenceRelationSDL,
  TestRelationDTO,
} from './__fixtures__';

@Resolver(() => TestResolverDTO)
class TestResolver extends ReferencesRelationsResolver(TestResolverDTO, {
  reference: { DTO: TestRelationDTO, keys: { id: 'stringField' } },
}) {
  constructor(service: TestService) {
    super(service);
  }
}

describe('ReferencesRelationMixin', () => {
  const expectResolverSDL = (sdl: string, opts?: ReferencesOpts<TestResolverDTO>) => {
    @Resolver(() => TestResolverDTO)
    class TestSDLResolver extends ReferencesRelationsResolver(TestResolverDTO, opts ?? {}) {
      @Query(() => TestResolverDTO)
      test(): TestResolverDTO {
        return { id: '1', stringField: 'foo' };
      }
    }
    return expectSDL([TestSDLResolver], sdl);
  };
  it('should not add reference methods if references empty', () => expectResolverSDL(referenceRelationEmptySDL));

  it('should use the add the reference if provided', () =>
    expectResolverSDL(referenceRelationSDL, {
      reference: { DTO: TestRelationDTO, keys: { id: 'stringField' }, dtoName: 'Test' },
    }));

  it('should set the field to nullable if set to true', () =>
    expectResolverSDL(referenceRelationNullableSDL, {
      reference: { DTO: TestRelationDTO, keys: { id: 'stringField' }, nullable: true },
    }));

  it('should return a references type from the passed in dto', async () => {
    const { resolver } = await createResolverFromNest(TestResolver);
    const dto: TestResolverDTO = {
      id: 'id-1',
      stringField: 'reference-id-1',
    };
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const result = await resolver.referenceReference(dto);
    // eslint-disable-next-line @typescript-eslint/naming-convention
    return expect(result).toEqual({ __typename: 'Reference', id: dto.stringField });
  });
});
