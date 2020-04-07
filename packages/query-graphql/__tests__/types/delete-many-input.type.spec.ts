import 'reflect-metadata';
import * as nestjsGraphql from '@nestjs/graphql';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { DeleteManyInputType, FilterType } from '../../src';
import { FilterableField } from '../../src/decorators';

const { ObjectType } = nestjsGraphql;

describe('DeleteManyInputType', (): void => {
  const inputTypeSpy = jest.spyOn(nestjsGraphql, 'InputType');
  const fieldSpy = jest.spyOn(nestjsGraphql, 'Field');

  @ObjectType()
  class DeleteManyDTO {
    @FilterableField()
    field!: string;
  }
  const Filter = FilterType(DeleteManyDTO);

  beforeEach(() => jest.clearAllMocks());

  it('should create an args type with an array field', () => {
    DeleteManyInputType(DeleteManyDTO);
    expect(inputTypeSpy).toBeCalledWith({ isAbstract: true });
    expect(inputTypeSpy).toBeCalledTimes(1);
    expect(fieldSpy).toHaveBeenCalledWith(expect.any(Function), {
      description: 'Filter to find records to delete',
    });
    expect(fieldSpy.mock.calls[0]![0]!()).toBe(Filter);
  });

  describe('validation', () => {
    it('should validate the filter is defined', () => {
      const Type = DeleteManyInputType(DeleteManyDTO);
      const input = {};
      const it = plainToClass(Type, input);
      const errors = validateSync(it);
      expect(errors).toEqual([
        {
          children: [],
          constraints: {
            isNotEmptyObject: 'filter must be a non-empty object',
          },
          property: 'filter',
          target: input,
        },
      ]);
    });

    it('should validate the filter is not empty', () => {
      const Type = DeleteManyInputType(DeleteManyDTO);
      const input = { filter: {} };
      const it = plainToClass(Type, input);
      const errors = validateSync(it);
      expect(errors).toEqual([
        {
          children: [],
          constraints: {
            isNotEmptyObject: 'filter must be a non-empty object',
          },
          property: 'filter',
          target: input,
          value: input.filter,
        },
      ]);
    });
  });
});
