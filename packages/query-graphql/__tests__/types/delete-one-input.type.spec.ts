import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { Resolver, Query, Args, Int, InputType } from '@nestjs/graphql';
import { DeleteOneInputType } from '../../src';
import { deleteOneInputTypeSDL, expectSDL } from '../__fixtures__';

describe('DeleteOneInputType', (): void => {
  @InputType()
  class DeleteOne extends DeleteOneInputType() {}

  it('should create an args type with the field as the type', async () => {
    @Resolver()
    class DeleteOneInputTypeSpec {
      @Query(() => Int)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      test(@Args('input') input: DeleteOne): number {
        return 1;
      }
    }
    return expectSDL([DeleteOneInputTypeSpec], deleteOneInputTypeSDL);
  });

  describe('validation', () => {
    it('should validate the id is defined', () => {
      const input = {};
      const it = plainToClass(DeleteOne, input);
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

    it('should validate the id is not empty', () => {
      const input = { id: '' };
      const it = plainToClass(DeleteOne, input);
      const errors = validateSync(it);
      expect(errors).toEqual([
        {
          children: [],
          constraints: {
            isNotEmpty: 'id should not be empty',
          },
          property: 'id',
          target: input,
          value: '',
        },
      ]);
    });
  });
});
