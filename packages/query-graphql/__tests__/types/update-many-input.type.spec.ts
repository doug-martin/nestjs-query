import 'reflect-metadata';
import * as typeGraphql from 'type-graphql';
import { plainToClass } from 'class-transformer';
import { MinLength, validateSync } from 'class-validator';
import { ObjectType } from 'type-graphql';
import { FilterableField } from '../../src/decorators';
import { UpdateManyInputType, FilterType } from '../../src/types';

describe('UpdateManyInputType', (): void => {
  const inputTypeSpy = jest.spyOn(typeGraphql, 'InputType');
  const fieldSpy = jest.spyOn(typeGraphql, 'Field');

  @ObjectType()
  class FakeType {
    @FilterableField()
    @MinLength(5)
    name!: string;
  }
  const Filter = FilterType(FakeType);

  beforeEach(() => jest.clearAllMocks());

  it('should create an args type with an array field', () => {
    UpdateManyInputType(FakeType, FakeType);
    expect(inputTypeSpy).toBeCalledTimes(1);
    expect(inputTypeSpy).toBeCalledWith('UpdateManyFakeTypesInput');
    expect(fieldSpy).toBeCalledTimes(2);
    expect(fieldSpy).toHaveBeenCalledWith(expect.any(Function), {
      description: 'Filter used to find fields to update',
    });
    expect(fieldSpy).toHaveBeenCalledWith(expect.any(Function), {
      description: 'The update to apply to all records found using the filter',
    });
    expect(fieldSpy.mock.calls[0]![0]!()).toBe(Filter);
    expect(fieldSpy.mock.calls[1]![0]!()).toBe(FakeType);
  });

  it('should return the input when accessing the update field', () => {
    const Type = UpdateManyInputType(FakeType, FakeType);
    const input = {};
    const it = plainToClass(Type, input);
    expect(it).toEqual(input);
  });

  describe('validation', () => {
    it('should validate the filter is not empty', () => {
      const Type = UpdateManyInputType(FakeType, FakeType);
      const input = { update: { name: 'hello world' } };
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

    it('should validate the update input', () => {
      const Type = UpdateManyInputType(FakeType, FakeType);
      const input = { filter: { name: { eq: 'hello world' } }, update: {} };
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
          target: input,
          value: input.update,
        },
      ]);
    });
  });
});
