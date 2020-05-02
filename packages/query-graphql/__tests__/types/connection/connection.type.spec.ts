import 'reflect-metadata';
import { Field, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { plainToClass } from 'class-transformer';
import { ConnectionType, CursorPagingType } from '../../../src';
import { connectionObjectTypeSDL, expectSDL } from '../../__fixtures__';

describe('ConnectionType', (): void => {
  @ObjectType('Test')
  class TestDto {
    @Field()
    stringField!: string;
  }

  const TestConnection = ConnectionType(TestDto);

  const createPage = (paging: CursorPagingType): CursorPagingType => {
    return plainToClass(CursorPagingType(), paging);
  };

  it('should store metadata', async () => {
    @Resolver()
    class TestConnectionTypeResolver {
      @Query(() => TestConnection)
      test(): ConnectionType<TestDto> | undefined {
        return undefined;
      }
    }

    return expectSDL([TestConnectionTypeResolver], connectionObjectTypeSDL);
  });

  it('should throw an error if the object is not registered with @nestjs/graphql', () => {
    class TestBadDto {
      @Field()
      stringField!: string;
    }

    expect(() => ConnectionType(TestBadDto)).toThrow(
      'Unable to make ConnectionType. Ensure TestBadDto is annotated with @nestjs/graphql @ObjectType',
    );
  });

  it('should create an empty connection when created with new', () => {
    expect(new TestConnection()).toEqual({
      pageInfo: { hasNextPage: false, hasPreviousPage: false },
      edges: [],
    });
  });

  describe('.createFromPromise', () => {
    it('should create a connections response with an empty query', async () => {
      const queryMany = jest.fn();
      const response = await TestConnection.createFromPromise(queryMany, {});
      expect(queryMany).toHaveBeenCalledTimes(0);
      expect(response).toEqual({
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
    });

    it('should create a connections response with an empty paging', async () => {
      const queryMany = jest.fn();
      const response = await TestConnection.createFromPromise(queryMany, { paging: {} });
      expect(queryMany).toHaveBeenCalledTimes(0);
      expect(response).toEqual({
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
    });

    describe('with first', () => {
      it('should return hasNextPage and hasPreviousPage false when there are the exact number of records', async () => {
        const queryMany = jest.fn();
        queryMany.mockResolvedValueOnce([{ stringField: 'foo1' }, { stringField: 'foo2' }]);
        const response = await TestConnection.createFromPromise(queryMany, { paging: createPage({ first: 2 }) });
        expect(queryMany).toHaveBeenCalledTimes(1);
        expect(queryMany).toHaveBeenCalledWith({ paging: { limit: 3, offset: 0 } });
        expect(response).toEqual({
          edges: [
            {
              cursor: 'YXJyYXljb25uZWN0aW9uOjA=',
              node: {
                stringField: 'foo1',
              },
            },
            {
              cursor: 'YXJyYXljb25uZWN0aW9uOjE=',
              node: {
                stringField: 'foo2',
              },
            },
          ],
          pageInfo: {
            endCursor: 'YXJyYXljb25uZWN0aW9uOjE=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
          },
        });
      });

      it('should return hasNextPage true and hasPreviousPage false when the number of records more than the first', async () => {
        const queryMany = jest.fn();
        queryMany.mockResolvedValueOnce([{ stringField: 'foo1' }, { stringField: 'foo2' }, { stringField: 'foo3' }]);
        const response = await TestConnection.createFromPromise(queryMany, { paging: createPage({ first: 2 }) });
        expect(queryMany).toHaveBeenCalledTimes(1);
        expect(queryMany).toHaveBeenCalledWith({ paging: { limit: 3, offset: 0 } });
        expect(response).toEqual({
          edges: [
            {
              cursor: 'YXJyYXljb25uZWN0aW9uOjA=',
              node: {
                stringField: 'foo1',
              },
            },
            {
              cursor: 'YXJyYXljb25uZWN0aW9uOjE=',
              node: {
                stringField: 'foo2',
              },
            },
          ],
          pageInfo: {
            endCursor: 'YXJyYXljb25uZWN0aW9uOjE=',
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
          },
        });
      });
    });

    describe('with last', () => {
      it("should return hasPreviousPage false if paging backwards and we're on the first page", async () => {
        const queryMany = jest.fn();
        queryMany.mockResolvedValueOnce([{ stringField: 'foo1' }]);
        const response = await TestConnection.createFromPromise(queryMany, {
          paging: createPage({ last: 2, before: 'YXJyYXljb25uZWN0aW9uOjE=' }),
        });
        expect(queryMany).toHaveBeenCalledTimes(1);
        expect(queryMany).toHaveBeenCalledWith({ paging: { limit: 1, offset: 0 } });
        expect(response).toEqual({
          edges: [
            {
              cursor: 'YXJyYXljb25uZWN0aW9uOjA=',
              node: {
                stringField: 'foo1',
              },
            },
          ],
          pageInfo: {
            endCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
          },
        });
      });

      it('should return hasPreviousPage true if paging backwards and there is an additional node', async () => {
        const queryMany = jest.fn();
        queryMany.mockResolvedValueOnce([{ stringField: 'foo1' }, { stringField: 'foo2' }, { stringField: 'foo3' }]);
        const response = await TestConnection.createFromPromise(queryMany, {
          paging: createPage({ last: 2, before: 'YXJyYXljb25uZWN0aW9uOjM=' }),
        });
        expect(queryMany).toHaveBeenCalledTimes(1);
        expect(queryMany).toHaveBeenCalledWith({ paging: { limit: 2, offset: 0 } });
        expect(response).toEqual({
          edges: [
            {
              cursor: 'YXJyYXljb25uZWN0aW9uOjE=',
              node: {
                stringField: 'foo2',
              },
            },
            {
              cursor: 'YXJyYXljb25uZWN0aW9uOjI=',
              node: {
                stringField: 'foo3',
              },
            },
          ],
          pageInfo: {
            endCursor: 'YXJyYXljb25uZWN0aW9uOjI=',
            hasNextPage: true,
            hasPreviousPage: true,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjE=',
          },
        });
      });
    });

    it('should create an empty connection', async () => {
      const queryMany = jest.fn();
      queryMany.mockResolvedValueOnce([]);
      const response = await TestConnection.createFromPromise(queryMany, {
        paging: createPage({ first: 2 }),
      });
      expect(queryMany).toHaveBeenCalledTimes(1);
      expect(queryMany).toHaveBeenCalledWith({ paging: { limit: 3, offset: 0 } });
      expect(response).toEqual({
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
    });
  });
});
