import { plainToClass } from 'class-transformer';
import { MinLength, validateSync } from 'class-validator';
import { Resolver, Query, Int, Args, InputType, Field } from '@nestjs/graphql';
import { CreateOneInputType } from '../../src';
import { generateSchema } from '../__fixtures__';

describe('CreateOneInputType', (): void => {
  @InputType()
  class FakeType {
    @Field()
    @MinLength(5)
    field!: string;
  }
  @InputType()
  class CreateOne extends CreateOneInputType('fakeInput', FakeType) {}

  it('should create an args type with the field as the type', async () => {
    @Resolver()
    class CreateOneInputTypeSpec {
      @Query(() => Int)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      test(@Args('input') input: CreateOne): number {
        return 1;
      }
    }
    const schema = await generateSchema([CreateOneInputTypeSpec]);
    expect(schema).toMatchSnapshot();
  });

  it('should properly assign the input field', () => {
    const input = { field: 'hello' };
    const it = plainToClass(CreateOne, { input });
    expect(it.input).toEqual(input);
    expect(it.input).toBeInstanceOf(FakeType);
  });

  it('should assign the typeName to the input field', () => {
    const input = { field: 'hello' };
    const it = plainToClass(CreateOne, { fakeInput: input });
    expect(it.input).toEqual(input);
    expect(it.input).toBeInstanceOf(FakeType);
  });

  describe('validation', () => {
    it('should validate the input property', () => {
      const input = { field: 'hola' };
      const it = plainToClass(CreateOne, { input });
      const errors = validateSync(it);
      expect(errors).toEqual([
        {
          children: [
            {
              children: [],
              constraints: {
                minLength: 'field must be longer than or equal to 5 characters',
              },
              property: 'field',
              target: input,
              value: input.field,
            },
          ],
          property: 'input',
          target: { input },
          value: input,
        },
      ]);
    });

    it('should assign the typeName to the input field', () => {
      const input = { field: 'hola' };
      const it = plainToClass(CreateOne, { fakeInput: input });
      const errors = validateSync(it);
      expect(errors).toEqual([
        {
          children: [
            {
              children: [],
              constraints: {
                minLength: 'field must be longer than or equal to 5 characters',
              },
              property: 'field',
              target: input,
              value: input.field,
            },
          ],
          property: 'input',
          target: { input },
          value: input,
        },
      ]);
    });
  });
});
