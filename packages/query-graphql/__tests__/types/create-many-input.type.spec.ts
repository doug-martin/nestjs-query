import { plainToClass } from 'class-transformer';
import { validateSync, MinLength } from 'class-validator';
import { InputType, Resolver, Args, Int, Query, Field } from '@nestjs/graphql';
import { CreateManyInputType } from '../../src';
import { generateSchema } from '../__fixtures__';

describe('CreateManyInputType', (): void => {
  @InputType()
  class FakeType {
    @Field()
    @MinLength(5)
    field!: string;
  }

  @InputType()
  class CreateMany extends CreateManyInputType('fakeInput', FakeType) {}

  it('should create an args type with the field as the type', async () => {
    @Resolver()
    class CreateManyInputTypeSpec {
      @Query(() => Int)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      test(@Args('input') input: CreateMany): number {
        return 1;
      }
    }
    const schema = await generateSchema([CreateManyInputTypeSpec]);
    expect(schema).toMatchSnapshot();
  });

  it('should properly assign the input field', () => {
    const input = [{ field: 'hello' }];
    const it = plainToClass(CreateMany, { input });
    expect(it.input).toEqual(input);
    it.input.forEach((i) => expect(i).toBeInstanceOf(FakeType));
  });

  it('should assign the typeName to the input field', () => {
    const input = [{ field: 'hello' }];
    const it = plainToClass(CreateMany, { fakeInput: input });
    expect(it.input).toEqual(input);
    it.input.forEach((i) => expect(i).toBeInstanceOf(FakeType));
  });

  describe('validation', () => {
    it('should validate the input property', () => {
      const input = [{ field: 'hola' }];
      const it = plainToClass(CreateMany, { input });
      const errors = validateSync(it);
      expect(errors).toEqual([
        {
          children: [
            {
              children: [
                {
                  children: [],
                  constraints: {
                    minLength: 'field must be longer than or equal to 5 characters',
                  },
                  property: 'field',
                  target: input[0],
                  value: input[0].field,
                },
              ],
              property: '0',
              target: input,
              value: input[0],
            },
          ],
          property: 'input',
          target: {
            input,
          },
          value: input,
        },
      ]);
    });

    it('should assign the typeName to the input field', () => {
      const input = [{ field: 'hola' }];
      const it = plainToClass(CreateMany, { fakeInput: input });
      const errors = validateSync(it);
      expect(errors).toEqual([
        {
          children: [
            {
              children: [
                {
                  children: [],
                  constraints: {
                    minLength: 'field must be longer than or equal to 5 characters',
                  },
                  property: 'field',
                  target: input[0],
                  value: input[0].field,
                },
              ],
              property: '0',
              target: input,
              value: input[0],
            },
          ],
          property: 'input',
          target: {
            input,
          },
          value: input,
        },
      ]);
    });
  });
});
