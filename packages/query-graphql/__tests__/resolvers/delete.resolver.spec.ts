import { DeleteManyResponse } from '@nestjs-query/core';
import { Resolver, Query, Field, InputType } from '@nestjs/graphql';
import { when, objectContaining } from 'ts-mockito';
import { DeleteManyInputType, DeleteOneInputType, DeleteResolver, DeleteResolverOpts } from '../../src';
import { expectSDL } from '../__fixtures__';
import {
  deleteBasicResolverSDL,
  deleteCustomManyInputResolverSDL,
  deleteCustomNameResolverSDL,
  deleteCustomOneInputResolverSDL,
  deleteDisabledResolverSDL,
  deleteOneDisabledResolverSDL,
  deleteManyDisabledResolverSDL,
  TestService,
  createResolverFromNest,
} from './__fixtures__';
import { TestResolverDTO } from './__fixtures__/test-resolver.dto';

@Resolver(() => TestResolverDTO)
class TestResolver extends DeleteResolver(TestResolverDTO) {
  constructor(service: TestService) {
    super(service);
  }
}

describe('DeleteResolver', () => {
  const expectResolverSDL = (sdl: string, opts?: DeleteResolverOpts<TestResolverDTO>) => {
    @Resolver(() => TestResolverDTO)
    class TestSDLResolver extends DeleteResolver(TestResolverDTO, opts) {
      @Query(() => TestResolverDTO)
      test(): TestResolverDTO {
        return { id: '1', stringField: 'foo' };
      }
    }
    return expectSDL([TestSDLResolver], sdl);
  };

  it('should create a DeleteResolver for the DTO', () => {
    return expectResolverSDL(deleteBasicResolverSDL);
  });

  it('should use the dtoName if provided', () => {
    return expectResolverSDL(deleteCustomNameResolverSDL, { dtoName: 'Test' });
  });

  it('should not expose delete methods if disabled', () => {
    return expectResolverSDL(deleteDisabledResolverSDL, { disabled: true });
  });

  describe('#deleteOne', () => {
    it('should use the provided DeleteOneInput type', () => {
      @InputType()
      class CustomDeleteOneInput {
        @Field()
        id!: string;

        @Field()
        foo!: string;
      }
      return expectResolverSDL(deleteCustomOneInputResolverSDL, {
        DeleteOneInput: CustomDeleteOneInput,
      });
    });

    it('should not expose delete one method if disabled', () => {
      return expectResolverSDL(deleteOneDisabledResolverSDL, { one: { disabled: true } });
    });

    it('should call the service deleteOne with the provided input', async () => {
      const { resolver, mockService } = await createResolverFromNest(TestResolver);
      const input: DeleteOneInputType = {
        id: 'id-1',
      };
      const output: TestResolverDTO = {
        id: 'id-1',
        stringField: 'foo',
      };
      when(mockService.deleteOne(input.id)).thenResolve(output);
      const result = await resolver.deleteOne({ input });
      return expect(result).toEqual(output);
    });
  });

  describe('#deleteMany', () => {
    it('should not delete a new type if the DeleteManyArgs is supplied', () => {
      @InputType()
      class CustomDeleteManyInput extends DeleteManyInputType(TestResolverDTO) {
        @Field()
        foo!: string;
      }
      return expectResolverSDL(deleteCustomManyInputResolverSDL, {
        DeleteManyInput: CustomDeleteManyInput,
      });
    });

    it('should not expose delete many method if disabled', () => {
      return expectResolverSDL(deleteManyDisabledResolverSDL, { many: { disabled: true } });
    });

    it('should call the service deleteMany with the provided input', async () => {
      const { resolver, mockService } = await createResolverFromNest(TestResolver);
      const input: DeleteManyInputType<TestResolverDTO> = {
        filter: { id: { eq: 'id-1' } },
      };
      const output: DeleteManyResponse = { deletedCount: 1 };
      when(mockService.deleteMany(objectContaining(input.filter))).thenResolve(output);
      const result = await resolver.deleteMany({ input });
      return expect(result).toEqual(output);
    });
  });
});
