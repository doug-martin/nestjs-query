import { plainToClass } from 'class-transformer';
import { MinLength, validateSync } from 'class-validator';
import { ObjectType, Resolver, Args, Query, InputType, Int } from '@nestjs/graphql';
import { FilterableField } from '../../src/decorators';
import { UpdateManyInputType } from '../../src/types';
import { generateSchema } from '../__fixtures__';

describe('UpdateManyInputType', (): void => {
  @InputType('FakeUpdateManyInput')
  @ObjectType()
  class FakeUpdateManyType {
    @FilterableField()
    @MinLength(5)
    name!: string;
  }
  @InputType()
  class UpdateMany extends UpdateManyInputType(FakeUpdateManyType, FakeUpdateManyType) {}

  it('should create an args type with the field as the type', async () => {
    @Resolver()
    class UpdateManyInputTypeSpec {
      @Query(() => Int)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      updateTest(@Args('input') input: UpdateMany): number {
        return 1;
      }
    }
    const schema = await generateSchema([UpdateManyInputTypeSpec]);
    expect(schema).toMatchSnapshot();
  });

  it('should return the input when accessing the update field', () => {
    const Type = UpdateManyInputType(FakeUpdateManyType, FakeUpdateManyType);
    const input = {};
    const it = plainToClass(Type, input);
    expect(it).toEqual(input);
  });

  describe('validation', () => {
    it('should validate the filter is not empty', () => {
      const input = { update: { name: 'hello world' } };
      const it = plainToClass(UpdateMany, input);
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
      const input = { filter: { name: { eq: 'hello world' } }, update: {} };
      const it = plainToClass(UpdateMany, input);
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
