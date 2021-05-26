import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { Resolver, Query, Int, InputType, Args } from '@nestjs/graphql';
import { generateSchema } from '../../__fixtures__';
import { getOrCreateCursorPagingType } from '../../../src/types/query/paging';

describe('PagingType', (): void => {
  const CursorPaging = getOrCreateCursorPagingType();
  it('should create the correct filter graphql schema', async () => {
    @InputType()
    class Paging extends CursorPaging {}

    @Resolver()
    class PagingTypeSpec {
      @Query(() => Int)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      test(@Args('input') input: Paging): number {
        return 1;
      }
    }
    const schema = await generateSchema([PagingTypeSpec]);
    expect(schema).toMatchSnapshot();
  });

  it('throw a validation error if first is defined with before', () => {
    const paging = plainToClass(CursorPaging, {
      first: 10,
      before: 'YXJyYXljb25uZWN0aW9uOjEx',
    });
    expect(validateSync(paging)).toEqual([
      {
        children: [],
        constraints: {
          CannotUseWith: 'Cannot be used with `after` , `first`.',
          CannotUseWithout: 'Cannot be used without `last`.',
        },
        property: 'before',
        target: {
          before: 'YXJyYXljb25uZWN0aW9uOjEx',
          first: 10,
        },
        value: 'YXJyYXljb25uZWN0aW9uOjEx',
      },
      {
        children: [],
        constraints: {
          CannotUseWith: 'Cannot be used with `before` , `last`.',
        },
        property: 'first',
        target: {
          before: 'YXJyYXljb25uZWN0aW9uOjEx',
          first: 10,
        },
        value: 10,
      },
    ]);
  });

  it('throw a validation error if last is defined with after', () => {
    const paging = plainToClass(CursorPaging, {
      last: 10,
      after: 'YXJyYXljb25uZWN0aW9uOjEx',
    });
    expect(validateSync(paging)).toEqual([
      {
        children: [],
        constraints: {
          CannotUseWith: 'Cannot be used with `before` , `last`.',
          CannotUseWithout: 'Cannot be used without `first`.',
        },
        property: 'after',
        target: {
          after: 'YXJyYXljb25uZWN0aW9uOjEx',
          last: 10,
        },
        value: 'YXJyYXljb25uZWN0aW9uOjEx',
      },
      {
        children: [],
        constraints: {
          CannotUseWith: 'Cannot be used with `after` , `first`.',
          CannotUseWithout: 'Cannot be used without `before`.',
        },
        property: 'last',
        target: {
          after: 'YXJyYXljb25uZWN0aW9uOjEx',
          last: 10,
        },
        value: 10,
      },
    ]);
  });

  it('throw a validation error if after is defined without first', () => {
    const paging = plainToClass(CursorPaging, {
      after: 'YXJyYXljb25uZWN0aW9uOjEx',
    });
    const validateErrors = validateSync(paging);
    expect(validateErrors).toEqual([
      {
        children: [],
        constraints: {
          CannotUseWithout: 'Cannot be used without `first`.',
        },
        property: 'after',
        target: {
          after: 'YXJyYXljb25uZWN0aW9uOjEx',
        },
        value: 'YXJyYXljb25uZWN0aW9uOjEx',
      },
    ]);
  });

  it('throw a validation before if after is defined without last', () => {
    const paging = plainToClass(CursorPaging, {
      before: 'YXJyYXljb25uZWN0aW9uOjEx',
    });
    const validateErrors = validateSync(paging);
    expect(validateErrors).toEqual([
      {
        children: [],
        constraints: {
          CannotUseWithout: 'Cannot be used without `last`.',
        },
        property: 'before',
        target: {
          before: 'YXJyYXljb25uZWN0aW9uOjEx',
        },
        value: 'YXJyYXljb25uZWN0aW9uOjEx',
      },
    ]);
  });
});
