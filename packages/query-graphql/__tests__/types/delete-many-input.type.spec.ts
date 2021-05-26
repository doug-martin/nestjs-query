import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { InputType, Resolver, Query, Args, Int, ObjectType } from '@nestjs/graphql';
import { DeleteManyInputType } from '../../src';
import { FilterableField } from '../../src/decorators';
import { generateSchema } from '../__fixtures__';

describe('DeleteManyInputType', (): void => {
  @ObjectType()
  class DeleteManyDTO {
    @FilterableField()
    field!: string;
  }

  @InputType()
  class DeleteMany extends DeleteManyInputType(DeleteManyDTO) {}

  it('should create an args type with the field as the type', async () => {
    @Resolver()
    class DeleteManyInputTypeSpec {
      @Query(() => Int)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      test(@Args('input') input: DeleteMany): number {
        return 1;
      }
    }
    const schema = await generateSchema([DeleteManyInputTypeSpec]);
    expect(schema).toMatchSnapshot();
  });

  describe('validation', () => {
    it('should validate the filter is defined', () => {
      const input = {};
      const it = plainToClass(DeleteMany, input);
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
      const input = { filter: {} };
      const it = plainToClass(DeleteMany, input);
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
