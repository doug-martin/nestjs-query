import 'reflect-metadata';
import * as typeGraphql from 'type-graphql';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { ObjectType } from 'type-graphql';
import { DeleteManyInputType, FilterType } from '../../src';
import { FilterableField } from '../../src/decorators';

describe('DeleteManyInputType', (): void => {
  const inputTypeSpy = jest.spyOn(typeGraphql, 'InputType');
  const fieldSpy = jest.spyOn(typeGraphql, 'Field');

  @ObjectType()
  class DeleteManyDTO {
    @FilterableField()
    field!: string;
  }
  const Filter = FilterType(DeleteManyDTO);

  beforeEach(() => jest.clearAllMocks());

  it('should create an args type with an array field', () => {
    DeleteManyInputType(DeleteManyDTO);
    expect(inputTypeSpy).toBeCalledWith(`DeleteManyDeleteManyDTOSInput`);
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
