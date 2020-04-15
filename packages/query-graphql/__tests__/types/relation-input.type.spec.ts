import 'reflect-metadata';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { InputType, Resolver, Query, Args, Int } from '@nestjs/graphql';
import { RelationInputType } from '../../src';
import { expectSDL, relationInputTypeSDL } from '../__fixtures__';

describe('RelationInputType', (): void => {
  @InputType()
  class RelationInput extends RelationInputType() {}

  it('should create an args type with an array field', () => {
    @Resolver()
    class RelationInputTypeSpec {
      @Query(() => Int)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      test(@Args('input') input: RelationInput): number {
        return 1;
      }
    }
    return expectSDL([RelationInputTypeSpec], relationInputTypeSDL);
  });

  it('should return the input when accessing the update field', () => {
    const input: RelationInputType = { id: 1, relationId: 2 };
    const it = plainToClass(RelationInput, input);
    expect(it.id).toEqual(input.id);
    expect(it.relationId).toEqual(input.relationId);
  });

  describe('validation', () => {
    it('should validate the id is defined', () => {
      const input = { relationId: 1 };
      const it = plainToClass(RelationInput, input);
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
      const input = { id: '', relationId: 1 };
      const it = plainToClass(RelationInput, input);
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

    it('should validate that relationId is defined', () => {
      const input = { id: 1 };
      const it = plainToClass(RelationInput, input);
      const errors = validateSync(it);
      expect(errors).toEqual([
        {
          children: [],
          constraints: {
            isNotEmpty: 'relationId should not be empty',
          },
          property: 'relationId',
          target: input,
        },
      ]);
    });

    it('should validate that relationId is not empty', () => {
      const input: RelationInputType = { id: 1, relationId: '' };
      const it = plainToClass(RelationInput, input);
      const errors = validateSync(it);
      expect(errors).toEqual([
        {
          children: [],
          constraints: {
            isNotEmpty: 'relationId should not be empty',
          },
          property: 'relationId',
          target: input,
          value: input.relationId,
        },
      ]);
    });
  });
});
