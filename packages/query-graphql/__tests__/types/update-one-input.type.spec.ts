import 'reflect-metadata';
import { plainToClass } from 'class-transformer';
import { validateSync, MinLength } from 'class-validator';
import { InputType, Resolver, Args, Field, Query, Int } from '@nestjs/graphql';
import { UpdateOneInputType } from '../../src';
import { expectSDL, updateOneInputTypeSDL } from '../__fixtures__';

describe('UpdateOneInputType', (): void => {
  @InputType()
  class FakeUpdateOneType {
    @Field()
    @MinLength(5)
    name!: string;
  }

  @InputType()
  class UpdateOne extends UpdateOneInputType(FakeUpdateOneType) {}

  it('should create an args type with the field as the type', async () => {
    @Resolver()
    class UpdateOneInputTypeSpec {
      @Query(() => Int)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      updateTest(@Args('input') input: UpdateOne): number {
        return 1;
      }
    }
    return expectSDL([UpdateOneInputTypeSpec], updateOneInputTypeSDL);
  });

  describe('validation', () => {
    it('should validate id is defined is not empty', () => {
      const Type = UpdateOneInputType(FakeUpdateOneType);
      const input = { update: { name: 'hello world' } };
      const it = plainToClass(Type, input);
      const errors = validateSync(it);
      expect(errors).toEqual([
        {
          children: [],
          constraints: {
            isNotEmpty: 'id should not be empty',
          },
          property: 'id',
          target: input,
        },
      ]);
    });

    it('should validate id is not empty is defined is not empty', () => {
      const Type = UpdateOneInputType(FakeUpdateOneType);
      const input = { id: '', update: { name: 'hello world' } };
      const it = plainToClass(Type, input);
      const errors = validateSync(it);
      expect(errors).toEqual([
        {
          children: [],
          constraints: {
            isNotEmpty: 'id should not be empty',
          },
          property: 'id',
          target: input,
          value: input.id,
        },
      ]);
    });

    it('should validate the update input', () => {
      const Type = UpdateOneInputType(FakeUpdateOneType);
      const input = { id: 'id-1', update: {} };
      const it = plainToClass(Type, input);
      const errors = validateSync(it);
      expect(errors).toEqual([
        {
          children: [
            {
              children: [],
              constraints: {
                minLength: 'name must be longer than or equal to 5 characters',
              },
              property: 'name',
              target: {},
            },
          ],
          property: 'update',
          target: it,
          value: it.update,
        },
      ]);
    });
  });
});
