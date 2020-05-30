import { Resolver, Query } from '@nestjs/graphql';
import { PageInfoType } from '../../../src/types/connection';
import { expectSDL, pageInfoObjectTypeSDL } from '../../__fixtures__';

describe('PageInfoType', (): void => {
  it('should create an edge type for the dto', () => {
    const PageInfo = PageInfoType();
    @Resolver()
    class TestPageInfoResolver {
      @Query(() => PageInfo)
      test(): PageInfoType | undefined {
        return undefined;
      }
    }
    return expectSDL([TestPageInfoResolver], pageInfoObjectTypeSDL);
  });

  it('should cache page info type', () => {
    expect(PageInfoType()).toBe(PageInfoType());
  });
});
