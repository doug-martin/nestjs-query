import 'reflect-metadata';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { Resolver, Query, Int, InputType, Args } from '@nestjs/graphql';
import { CursorPagingType } from '../../../src';
import { expectSDL, pagingInputTypeSDL } from '../../__fixtures__';

describe('PagingType', (): void => {
  const createPagingAndValidate = (obj: CursorPagingType) => {
    const paging = plainToClass(CursorPagingType(), obj);
    const validateErrors = validateSync(paging);
    return { paging, validateErrors };
  };

  const assertLimitAndOffset = (obj: CursorPagingType, limit: number, offset: number) => {
    const { paging, validateErrors } = createPagingAndValidate(obj);
    expect(validateErrors).toHaveLength(0);
    expect(paging.limit).toEqual(limit);
    expect(paging.offset).toEqual(offset);
  };

  it('should create the correct filter graphql schema', () => {
    @InputType()
    class Paging extends CursorPagingType() {}

    @Resolver()
    class PagingTypeSpec {
      @Query(() => Int)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      test(@Args('input') input: Paging): number {
        return 1;
      }
    }
    return expectSDL([PagingTypeSpec], pagingInputTypeSDL);
  });

  it('throw a validation error if first is defined with before', () => {
    const paging = plainToClass(CursorPagingType(), {
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
    const paging = plainToClass(CursorPagingType(), {
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
    const paging = plainToClass(CursorPagingType(), {
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
    const paging = plainToClass(CursorPagingType(), {
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

  it('handle a negative before offset', () => {
    const paging = plainToClass(CursorPagingType(), {
      last: 10,
      before: 'YXJyYXljb25uZWN0aW9uOi0x',
    });
    const validateErrors = validateSync(paging);
    expect(validateErrors).toHaveLength(0);
    expect(paging.limit).toEqual(0);
    expect(paging.offset).toEqual(0);
  });

  it('handle a negative after offset', () => {
    const paging = plainToClass(CursorPagingType(), {
      first: 10,
      after: 'YXJyYXljb25uZWN0aW9uOi0xMA==',
    });
    const validateErrors = validateSync(paging);
    expect(validateErrors).toHaveLength(0);
    expect(paging.limit).toEqual(10);
    expect(paging.offset).toEqual(0);
  });

  it('handle a missing first', () => {
    const paging = plainToClass(CursorPagingType(), {
      after: 'YXJyYXljb25uZWN0aW9uOi0xMA==',
    });
    expect(paging.limit).toEqual(0);
    expect(paging.offset).toEqual(0);
  });

  it('handle an empty after cursor', () => {
    const paging = plainToClass(CursorPagingType(), {
      first: 10,
      after: '',
    });
    const validateErrors = validateSync(paging);
    expect(validateErrors).toHaveLength(0);
    expect(paging.limit).toEqual(10);
    expect(paging.offset).toEqual(0);
  });

  it('handle an missing after', () => {
    const paging = plainToClass(CursorPagingType(), {
      first: 10,
    });
    const validateErrors = validateSync(paging);
    expect(validateErrors).toHaveLength(0);
    expect(paging.limit).toEqual(10);
    expect(paging.offset).toEqual(0);
  });

  it('handle an empty last limit', () => {
    const paging = plainToClass(CursorPagingType(), {
      before: 'YXJyYXljb25uZWN0aW9uOjEx',
    });
    expect(paging.limit).toEqual(0);
    expect(paging.offset).toEqual(0);
  });

  it('should return an undefined limit when the paging object is empty', () => {
    const paging = new (CursorPagingType())();
    expect(paging.limit).toBeUndefined();
  });

  it('should return an undefined offset when the paging object is empty', () => {
    const paging = new (CursorPagingType())();
    expect(paging.offset).toBeUndefined();
  });

  it('convert the cursor paging to a limit and offset going forward', () =>
    assertLimitAndOffset(
      {
        first: 10,
        after: 'YXJyYXljb25uZWN0aW9uOjEx',
      },
      10,
      12,
    ));

  it('convert the cursor paging to a limit and offset going backward', () =>
    assertLimitAndOffset(
      {
        last: 10,
        before: 'YXJyYXljb25uZWN0aW9uOjEx',
      },
      10,
      1,
    ));
});
