// eslint-disable-next-line max-classes-per-file
import { DeepPartial } from '@nestjs-query/core';
import { Resolver, Query, InputType } from '@nestjs/graphql';
import { when, objectContaining } from 'ts-mockito';
import { CreateManyInputType, CreateOneInputType, CreateResolver, CreateResolverOpts } from '../../src';
import { expectSDL } from '../__fixtures__';
import {
  createBasicResolverSDL,
  createCustomDTOResolverSDL,
  createCustomManyInputResolverSDL,
  createCustomNameResolverSDL,
  createCustomOneInputResolverSDL,
  createDisabledResolverSDL,
  createManyDisabledResolverSDL,
  createOneDisabledResolverSDL,
  createResolverFromNest,
  TestResolverDTO,
  TestResolverInputDTO,
  TestService,
} from './__fixtures__';

@Resolver(() => TestResolverDTO)
class TestResolver extends CreateResolver(TestResolverDTO) {
  constructor(service: TestService) {
    super(service);
  }
}

describe('CreateResolver', () => {
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

  it('should create a CreateResolver for the DTO', () => {
    return expectResolverSDL(createBasicResolverSDL);
  });

  it('should use the dtoName if provided', () => {
    return expectResolverSDL(createCustomNameResolverSDL, { dtoName: 'Test' });
  });

  it('should use the CreateDTOClass if provided', () => {
    return expectResolverSDL(createCustomDTOResolverSDL, { CreateDTOClass: TestResolverInputDTO });
  });

  it('should not expose create methods if disabled', () => {
    return expectResolverSDL(createDisabledResolverSDL, { disabled: true });
  });

  describe('#createOne', () => {
    it('should use the provided CreateOneInput type', () => {
      @InputType()
      class CreateOneInput extends CreateOneInputType('createResolverDTO', TestResolverInputDTO) {}
      return expectResolverSDL(createCustomOneInputResolverSDL, {
        CreateOneInput,
      });
    });

    it('should not expose create one method if disabled', () => {
      return expectResolverSDL(createOneDisabledResolverSDL, { one: { disabled: true } });
    });

    it('should call the service createOne with the provided input', async () => {
      const { resolver, mockService } = await createResolverFromNest(TestResolver);
      const args: CreateOneInputType<DeepPartial<TestResolverDTO>> = {
        input: {
          stringField: 'foo',
        },
      };
      const output: TestResolverDTO = {
        id: 'id-1',
        stringField: 'foo',
      };
      when(mockService.createOne(objectContaining(args.input))).thenResolve(output);
      const result = await resolver.createOne({ input: args });
      return expect(result).toEqual(output);
    });
  });

  describe('#createMany', () => {
    it('should not create a new type if the CreateManyArgs is supplied', () => {
      @InputType()
      class CreateManyInput extends CreateManyInputType('testResolvers', TestResolverInputDTO) {}
      return expectResolverSDL(createCustomManyInputResolverSDL, {
        CreateManyInput,
      });
    });

    it('should not expose create many method if disabled', () => {
      return expectResolverSDL(createManyDisabledResolverSDL, { many: { disabled: true } });
    });

    it('should call the service createMany with the provided input', async () => {
      const { resolver, mockService } = await createResolverFromNest(TestResolver);
      const args: CreateManyInputType<Partial<TestResolverDTO>> = {
        input: [
          {
            stringField: 'foo',
          },
        ],
      };
      const output: TestResolverDTO[] = [
        {
          id: 'id-1',
          stringField: 'foo',
        },
      ];
      when(mockService.createMany(objectContaining(args.input))).thenResolve(output);
      const result = await resolver.createMany({ input: args });
      return expect(result).toEqual(output);
    });
  });
});
