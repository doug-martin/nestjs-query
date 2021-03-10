// eslint-disable-next-line max-classes-per-file
import { Field, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { plainToClass } from 'class-transformer';
import { ConnectionType, OffsetPagingType, PagingStrategies } from '../../../src';
import {
  offsetConnectionObjectTypeSDL,
  offsetConnectionObjectTypeWithTotalCountSDL,
  expectSDL,
} from '../../__fixtures__';

describe('OffsetConnectionType', (): void => {
  @ObjectType('Test')
  class TestDto {
    @Field()
    stringField!: string;

    @Field()
    numberField!: number;

    @Field()
    boolField!: boolean;
  }

  @ObjectType('TestTotalCount')
  class TestTotalCountDto {
    @Field()
    stringField!: string;
  }

  const createPage = (paging: OffsetPagingType): OffsetPagingType => plainToClass(OffsetPagingType(), paging);

  const createTestDTO = (index: number): TestDto => ({
    stringField: `foo${index}`,
    numberField: index,
    boolField: index % 2 === 0,
  });

  it('should create the connection SDL', async () => {
    const TestConnection = ConnectionType(TestDto, { pagingStrategy: PagingStrategies.OFFSET });
    @Resolver()
    class TestConnectionTypeResolver {
      @Query(() => TestConnection)
      test(): ConnectionType<TestDto> | undefined {
        return undefined;
      }
    }

    return expectSDL([TestConnectionTypeResolver], offsetConnectionObjectTypeSDL);
  });

  it('should create the connection SDL with totalCount if enabled', async () => {
    const TestConnectionWithTotalCount = ConnectionType(TestTotalCountDto, {
      pagingStrategy: PagingStrategies.OFFSET,
      enableTotalCount: true,
    });
    @Resolver()
    class TestConnectionTypeResolver {
      @Query(() => TestConnectionWithTotalCount)
      test(): ConnectionType<TestDto> | undefined {
        return undefined;
      }
    }

    return expectSDL([TestConnectionTypeResolver], offsetConnectionObjectTypeWithTotalCountSDL);
  });

  it('should throw an error if the object is not registered with @nestjs/graphql', () => {
    class TestBadDto {
      @Field()
      stringField!: string;
    }

    expect(() => ConnectionType(TestBadDto, { pagingStrategy: PagingStrategies.OFFSET })).toThrow(
      'Unable to make OffsetConnectionType. Ensure TestBadDto is annotated with @nestjs/graphql @ObjectType',
    );
  });

  describe('limit offset offset connection', () => {
    const TestConnection = ConnectionType(TestDto, { pagingStrategy: PagingStrategies.OFFSET });

    it('should create an empty connection when created with new', () => {
      expect(new TestConnection()).toEqual({
        pageInfo: { hasNextPage: false, hasPreviousPage: false },
        nodes: [],
        totalCountFn: expect.any(Function),
      });
    });

    describe('.createFromPromise', () => {
      it('should create a connections response with an empty query', async () => {
        const queryMany = jest.fn();
        const response = await TestConnection.createFromPromise(queryMany, {});
        expect(queryMany).toHaveBeenCalledTimes(0);
        expect(response).toEqual({
          nodes: [],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
          },
          totalCountFn: expect.any(Function),
        });
      });

      it('should create a connections response with an empty paging', async () => {
        const queryMany = jest.fn();
        const response = await TestConnection.createFromPromise(queryMany, { paging: {} });
        expect(queryMany).toHaveBeenCalledTimes(0);
        expect(response).toEqual({
          nodes: [],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
          },
          totalCountFn: expect.any(Function),
        });
      });

      describe('with limit', () => {
        it('should return hasNextPage and hasPreviousPage false when there are the exact number of records', async () => {
          const queryMany = jest.fn();
          const dtos = [createTestDTO(1), createTestDTO(2)];
          queryMany.mockResolvedValueOnce([...dtos]);
          const response = await TestConnection.createFromPromise(queryMany, { paging: createPage({ limit: 2 }) });
          expect(queryMany).toHaveBeenCalledTimes(1);
          expect(queryMany).toHaveBeenCalledWith({ paging: { limit: 3, offset: 0 } });
          expect(response).toEqual({
            nodes: dtos,
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
            },
            totalCountFn: expect.any(Function),
          });
        });

        it('should return hasNextPage true and hasPreviousPage false when the number of records more than the limit and offset == 0', async () => {
          const queryMany = jest.fn();
          const dtos = [createTestDTO(1), createTestDTO(2), createTestDTO(3)];
          queryMany.mockResolvedValueOnce([...dtos]);
          const response = await TestConnection.createFromPromise(queryMany, { paging: createPage({ limit: 2 }) });
          expect(queryMany).toHaveBeenCalledTimes(1);
          expect(queryMany).toHaveBeenCalledWith({ paging: { limit: 3, offset: 0 } });
          expect(response).toEqual({
            nodes: [dtos[0], dtos[1]],
            pageInfo: {
              hasNextPage: true,
              hasPreviousPage: false,
            },
            totalCountFn: expect.any(Function),
          });
        });
      });

      describe('with offset', () => {
        it('should return hasPreviousPage false if offset == 0', async () => {
          const queryMany = jest.fn();
          const dtos = [createTestDTO(1)];
          queryMany.mockResolvedValueOnce([...dtos]);
          const response = await TestConnection.createFromPromise(queryMany, {
            paging: createPage({ limit: 1, offset: 0 }),
          });
          expect(queryMany).toHaveBeenCalledTimes(1);
          expect(queryMany).toHaveBeenCalledWith({ paging: { limit: 2, offset: 0 } });
          expect(response).toEqual({
            nodes: dtos,
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
            },
            totalCountFn: expect.any(Function),
          });
        });

        it('should return hasPreviousPage true if offset > 0', async () => {
          const queryMany = jest.fn();
          const dtos = [createTestDTO(1), createTestDTO(2), createTestDTO(3)];
          queryMany.mockResolvedValueOnce([...dtos]);
          const response = await TestConnection.createFromPromise(queryMany, {
            paging: createPage({ limit: 2, offset: 1 }),
          });
          expect(queryMany).toHaveBeenCalledTimes(1);
          expect(queryMany).toHaveBeenCalledWith({ paging: { limit: 3, offset: 1 } });
          expect(response).toEqual({
            nodes: [dtos[0], dtos[1]],
            pageInfo: {
              hasNextPage: true,
              hasPreviousPage: true,
            },
            totalCountFn: expect.any(Function),
          });
        });
      });

      it('should create an empty connection', async () => {
        const queryMany = jest.fn();
        queryMany.mockResolvedValueOnce([]);
        const response = await TestConnection.createFromPromise(queryMany, {
          paging: createPage({ limit: 2 }),
        });
        expect(queryMany).toHaveBeenCalledTimes(1);
        expect(queryMany).toHaveBeenCalledWith({ paging: { limit: 3, offset: 0 } });
        expect(response).toEqual({
          nodes: [],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
          },
          totalCountFn: expect.any(Function),
        });
      });
    });
  });
});
