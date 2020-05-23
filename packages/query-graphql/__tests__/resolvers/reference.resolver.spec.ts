import { when } from 'ts-mockito';
import { Resolver, Query } from '@nestjs/graphql';
import { CreateResolver, CreateResolverOpts, ReferenceResolver } from '../../src';
import { expectSDL } from '../__fixtures__';
import { createResolverFromNest, referenceBasicResolverSDL, TestResolverDTO, TestService } from './__fixtures__';

@Resolver(() => TestResolverDTO)
class TestResolver extends ReferenceResolver(TestResolverDTO, { key: 'id' }) {
  constructor(service: TestService) {
    super(service);
  }
}

describe('ReferenceResolver', () => {
  const expectResolverSDL = (sdl: string, opts?: CreateResolverOpts<TestResolverDTO>) => {
    @Resolver(() => TestResolverDTO)
    class TestSDLResolver extends CreateResolver(TestResolverDTO, opts) {
      @Query(() => TestResolverDTO)
      test(): TestResolverDTO {
        return { id: '1', stringField: 'foo' };
      }
    }
    return expectSDL([TestSDLResolver], sdl);
  };

  it('should create a new resolver with a resolveReference method', () => {
    return expectResolverSDL(referenceBasicResolverSDL);
  });

  it('should return the original resolver if key is not provided', () => {
    const TestReferenceResolver = ReferenceResolver(TestResolverDTO);
    return expect(TestReferenceResolver.prototype.resolveReference).toBeUndefined();
  });

  describe('#resolveReference', () => {
    it('should call the service getById with the provided input', async () => {
      const { resolver, mockService } = await createResolverFromNest(TestResolver);
      const id = 'id-1';
      const output: TestResolverDTO = {
        id,
        stringField: 'foo',
      };
      when(mockService.getById(id)).thenResolve(output);
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const result = await resolver.resolveReference({ __type: 'TestReference', id });
      return expect(result).toEqual(output);
    });

    it('should reject if the id is not found', async () => {
      const { resolver, mockService } = await createResolverFromNest(TestResolver);
      const id = 'id-1';
      const output: TestResolverDTO = {
        id,
        stringField: 'foo',
      };
      when(mockService.getById(id)).thenResolve(output);
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      return expect(resolver.resolveReference({ __type: 'TestReference' })).rejects.toThrow(
        'Unable to resolve reference, missing required key id for TestResolverDTO',
      );
    });
  });
});
