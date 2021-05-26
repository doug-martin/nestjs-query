// eslint-disable-next-line max-classes-per-file
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { Resolver, Query, Args, Int, InputType, ObjectType } from '@nestjs/graphql';
import { DeleteOneInputType, FilterableField, IDField } from '../../src';
import { generateSchema } from '../__fixtures__';

describe('DeleteOneInputType', (): void => {
  @ObjectType()
  class DeleteOneDTO {
    @FilterableField()
    field!: string;
  }

  @InputType()
  class DeleteOne extends DeleteOneInputType(DeleteOneDTO) {}

  it('should create an input type with id field as the type', async () => {
    @Resolver()
    class DeleteOneInputTypeSpec {
      @Query(() => Int)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      test(@Args('input') input: DeleteOne): number {
        return 1;
      }
    }
    const schema = await generateSchema([DeleteOneInputTypeSpec]);
    expect(schema).toMatchSnapshot();
  });

  it('should create an input type with a custom ID type', async () => {
    @ObjectType()
    class DeleteOneCustomIDDTO {
      @IDField(() => String)
      field!: string;
    }

    @InputType()
    class DeleteOneCustomId extends DeleteOneInputType(DeleteOneCustomIDDTO) {}

    @Resolver()
    class DeleteOneInputTypeSpec {
      @Query(() => Int)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      test(@Args('input') input: DeleteOneCustomId): number {
        return 1;
      }
    }
    const schema = await generateSchema([DeleteOneInputTypeSpec]);
    expect(schema).toMatchSnapshot();
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
