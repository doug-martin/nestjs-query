import { when, objectContaining } from 'ts-mockito';
import { UpdateManyResponse } from '@nestjs-query/core';
import { Resolver, Query, Field, InputType } from '@nestjs/graphql';
import {
  MutationArgsType,
  UpdateManyInputType,
  UpdateOneInputType,
  UpdateResolver,
  UpdateResolverOpts,
} from '../../src';
import { expectSDL } from '../__fixtures__';
import {
  createResolverFromNest,
  TestResolverDTO,
  TestResolverInputDTO,
  TestService,
  updateBasicResolverSDL,
  updateCustomManyInputResolverSDL,
  updateCustomNameResolverSDL,
  updateCustomOneInputResolverSDL,
  updateCustomDTOResolverSDL,
  updateManyDisabledResolverSDL,
  updateOneDisabledResolverSDL,
  updateDisabledResolverSDL,
} from './__fixtures__';

@Resolver(() => TestResolverDTO)
class TestResolver extends UpdateResolver(TestResolverDTO) {
  constructor(service: TestService) {
    super(service);
  }
}

describe('UpdateResolver', () => {
  const expectResolverSDL = (sdl: string, opts?: UpdateResolverOpts<TestResolverDTO>) => {
    @Resolver(() => TestResolverDTO)
    class TestSDLResolver extends UpdateResolver(TestResolverDTO, opts) {
      @Query(() => TestResolverDTO)
      test(): TestResolverDTO {
        return { id: '1', stringField: 'foo' };
      }
    }
    return expectSDL([TestSDLResolver], sdl);
  };

  it('should create a UpdateResolver for the DTO', () => {
    return expectResolverSDL(updateBasicResolverSDL);
  });

  it('should use the dtoName if provided', () => {
    return expectResolverSDL(updateCustomNameResolverSDL, { dtoName: 'Test' });
  });

  it('should use the UpdateDTOClass if provided', () => {
    return expectResolverSDL(updateCustomDTOResolverSDL, { UpdateDTOClass: TestResolverInputDTO });
  });

  it('should not expose update methods if disabled', () => {
    return expectResolverSDL(updateDisabledResolverSDL, { disabled: true });
  });

  describe('#updateOne', () => {
    it('should use the provided UpdateOneInput type', () => {
      @InputType()
      class CustomUpdateOneInput extends UpdateOneInputType(TestResolverInputDTO) {
        @Field()
        other!: string;
      }
      return expectResolverSDL(updateCustomOneInputResolverSDL, {
        UpdateOneInput: CustomUpdateOneInput,
      });
    });

    it('should not expose update one method if disabled', () => {
      return expectResolverSDL(updateOneDisabledResolverSDL, { one: { disabled: true } });
    });

    it('should call the service updateOne with the provided input', async () => {
      const { resolver, mockService } = await createResolverFromNest(TestResolver);
      const input: UpdateOneInputType<Partial<TestResolverDTO>> = {
        id: 'id-1',
        update: {
          stringField: 'foo',
        },
      };
      const output: TestResolverDTO = {
        id: 'id-1',
        stringField: 'foo',
      };
      when(mockService.updateOne(input.id, objectContaining(input.update))).thenResolve(output);
      const result = await resolver.updateOne({ input });
      return expect(result).toEqual(output);
    });
  });

  describe('#updateMany', () => {
    it('should not update a new type if the UpdateManyArgs is supplied', () => {
      @InputType()
      class CustomUpdateManyInput extends UpdateManyInputType(TestResolverDTO, TestResolverInputDTO) {
        @Field()
        other!: string;
      }
      return expectResolverSDL(updateCustomManyInputResolverSDL, {
        UpdateManyInput: CustomUpdateManyInput,
      });
    });

    it('should not expose update many method if disabled', () => {
      return expectResolverSDL(updateManyDisabledResolverSDL, { many: { disabled: true } });
    });

    it('should call the service updateMany with the provided input', async () => {
      const { resolver, mockService } = await createResolverFromNest(TestResolver);
      const input: MutationArgsType<UpdateManyInputType<TestResolverDTO, Partial<TestResolverDTO>>> = {
        input: {
          filter: { id: { eq: 'id-1' } },
          update: {
            stringField: 'foo',
          },
        },
      };
      const output: UpdateManyResponse = { updatedCount: 1 };
      when(
        mockService.updateMany(objectContaining(input.input.update), objectContaining(input.input.filter)),
      ).thenResolve(output);
      const result = await resolver.updateMany(input);
      return expect(result).toEqual(output);
    });
  });
});
