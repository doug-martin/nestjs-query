import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { Args, Query, Resolver, Int, InputType } from '@nestjs/graphql';
import { RelationsInputType } from '../../src';
import { expectSDL, relationsInputTypeSDL } from '../__fixtures__';

describe('RelationsInputType', (): void => {
  @InputType()
  class RelationsInput extends RelationsInputType() {}

  it('should create an args type with an array field', () => {
    @Resolver()
    class RelationsInputTypeSpec {
      @Query(() => Int)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      test(@Args('input') input: RelationsInput): number {
        return 1;
      }
    }
    return expectSDL([RelationsInputTypeSpec], relationsInputTypeSDL);
  });

  it('should return the input when accessing the update field', () => {
    const input: RelationsInputType = { id: 1, relationIds: [2, 3, 4] };
    const it = plainToClass(RelationsInput, input);
    expect(it.id).toEqual(input.id);
    expect(it.relationIds).toEqual(input.relationIds);
  });

  describe('validation', () => {
    it('should validate the id is defined', () => {
      const input = { relationIds: [2, 3, 4] };
      const it = plainToClass(RelationsInput, input);
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
      const input = { id: '', relationIds: [2, 3, 4] };
      const it = plainToClass(RelationsInput, input);
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

    it('should allow an empty relationIds array', () => {
      const input: RelationsInputType = { id: 1, relationIds: [] };
      const it = plainToClass(RelationsInput, input);
      const errors = validateSync(it);
      expect(errors).toEqual([]);
    });

    it('should validate that relationsIds is unique', () => {
      const input: RelationsInputType = { id: 1, relationIds: [1, 2, 1, 2] };
      const it = plainToClass(RelationsInput, input);
      const errors = validateSync(it);
      expect(errors).toEqual([
        {
          children: [],
          constraints: {
            arrayUnique: "All relationIds's elements must be unique",
          },
          property: 'relationIds',
          target: input,
          value: input.relationIds,
        },
      ]);
    });

    it('should validate that relationsIds does not contain an empty id', () => {
      const input: RelationsInputType = { id: 1, relationIds: [''] };
      const it = plainToClass(RelationsInput, input);
      const errors = validateSync(it);
      expect(errors).toEqual([
        {
          children: [],
          constraints: {
            isNotEmpty: 'each value in relationIds should not be empty',
          },
          property: 'relationIds',
          target: input,
          value: input.relationIds,
        },
      ]);
    });
  });
});
