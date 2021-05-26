// eslint-disable-next-line max-classes-per-file
import { plainToClass } from 'class-transformer';
import { validateSync, MinLength } from 'class-validator';
import { InputType, Resolver, Args, Field, Query, Int, ID, ObjectType } from '@nestjs/graphql';
import { IDField, UpdateOneInputType } from '../../src';
import { generateSchema } from '../__fixtures__';

describe('UpdateOneInputType', (): void => {
  @ObjectType()
  class FakeDTO {
    @Field(() => ID)
    id!: string;
  }

  @InputType()
  class FakeUpdateOneType {
    @Field()
    @MinLength(5)
    name!: string;
  }

  @InputType()
  class UpdateOne extends UpdateOneInputType(FakeDTO, FakeUpdateOneType) {}

  it('should create an input type with the id and update type as fields', async () => {
    @Resolver()
    class UpdateOneInputTypeSpec {
      @Query(() => Int)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      updateTest(@Args('input') input: UpdateOne): number {
        return 1;
      }
    }
    const schema = await generateSchema([UpdateOneInputTypeSpec]);
    expect(schema).toMatchSnapshot();
  });

  it('should create an input type with a custom id and update type as fields', async () => {
    @ObjectType()
    class FakeIDDTO {
      @IDField(() => String)
      id!: string;
    }

    @InputType()
    class UpdateOneCustomId extends UpdateOneInputType(FakeIDDTO, FakeUpdateOneType) {}

    @Resolver()
    class UpdateOneCustomIdInputTypeSpec {
      @Query(() => Int)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      updateTest(@Args('input') input: UpdateOneCustomId): number {
        return 1;
      }
    }
    const schema = await generateSchema([UpdateOneCustomIdInputTypeSpec]);
    expect(schema).toMatchSnapshot();
  });

  describe('validation', () => {
    it('should validate id is defined is not empty', () => {
      const Type = UpdateOneInputType(FakeDTO, FakeUpdateOneType);
      const input = { update: { name: 'hello world' } };
      const it = plainToClass(Type, input);
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

    it('should validate id is not empty is defined is not empty', () => {
      const Type = UpdateOneInputType(FakeDTO, FakeUpdateOneType);
      const input = { id: '', update: { name: 'hello world' } };
      const it = plainToClass(Type, input);
      const errors = validateSync(it);
      expect(errors).toEqual([
        {
          children: [],
          constraints: {
            isNotEmpty: 'id should not be empty',
          },
          property: 'id',
          target: input,
          value: input.id,
        },
      ]);
    });

    it('should validate the update input', () => {
      const Type = UpdateOneInputType(FakeDTO, FakeUpdateOneType);
      const input = { id: 'id-1', update: {} };
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
          target: it,
          value: it.update,
        },
      ]);
    });
  });
});
