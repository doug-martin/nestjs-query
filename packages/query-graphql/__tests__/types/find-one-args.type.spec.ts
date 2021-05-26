// eslint-disable-next-line max-classes-per-file
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { Resolver, Query, Args, Int, ArgsType, ObjectType } from '@nestjs/graphql';
import { FilterableField, FindOneArgsType, IDField } from '../../src';
import { generateSchema } from '../__fixtures__';

describe('FindOneArgsType', (): void => {
  @ObjectType()
  class FindOneDTO {
    @FilterableField()
    field!: string;
  }

  @ArgsType()
  class FindOne extends FindOneArgsType(FindOneDTO) {}

  it('should create an args type with id field as the type', async () => {
    @Resolver()
    class FindOneArgsTypeSpec {
      @Query(() => Int)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      test(@Args() input: FindOne): number {
        return 1;
      }
    }
    const schema = await generateSchema([FindOneArgsTypeSpec]);
    expect(schema).toMatchSnapshot();
  });

  it('should create an args type with a custom ID type', async () => {
    @ObjectType()
    class FindOneCustomIDDTO {
      @IDField(() => String)
      field!: string;
    }

    @ArgsType()
    class FindOneCustomId extends FindOneArgsType(FindOneCustomIDDTO) {}

    @Resolver()
    class FindOneArgsTypeSpec {
      @Query(() => Int)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      test(@Args() input: FindOneCustomId): number {
        return 1;
      }
    }
    const schema = await generateSchema([FindOneArgsTypeSpec]);
    expect(schema).toMatchSnapshot();
  });

  describe('validation', () => {
    it('should validate the id is defined', () => {
      const input = {};
      const it = plainToClass(FindOne, input);
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
      const it = plainToClass(FindOne, input);
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
