// eslint-disable-next-line max-classes-per-file
import { Field, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { plainToClass } from 'class-transformer';
import { OffsetConnectionType, OffsetPagingType, PagingStrategies } from '../../../src';
import { generateSchema } from '../../__fixtures__';
import { getOrCreateOffsetConnectionType } from '../../../src/types/connection';
import { getOrCreateOffsetPagingType } from '../../../src/types/query/paging';

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

  const createPage = (paging: OffsetPagingType): OffsetPagingType =>
    plainToClass(getOrCreateOffsetPagingType(), paging);

  const createTestDTO = (index: number): TestDto => ({
    stringField: `foo${index}`,
    numberField: index,
    boolField: index % 2 === 0,
  });

  it('should create the connection SDL', async () => {
    const TestConnection = getOrCreateOffsetConnectionType(TestDto, { pagingStrategy: PagingStrategies.OFFSET });
    @Resolver()
    class TestOffsetConnectionTypeResolver {
      @Query(() => TestConnection)
      test(): OffsetConnectionType<TestDto> | undefined {
        return undefined;
      }
    }
    const schema = await generateSchema([TestOffsetConnectionTypeResolver]);
    expect(schema).toMatchSnapshot();
  });

  it('should create the connection SDL with totalCount if enabled', async () => {
    const TestConnectionWithTotalCount = getOrCreateOffsetConnectionType(TestTotalCountDto, {
      pagingStrategy: PagingStrategies.OFFSET,
      enableTotalCount: true,
    });
    @Resolver()
    class TestOffsetConnectionTypeResolver {
      @Query(() => TestConnectionWithTotalCount)
      test(): OffsetConnectionType<TestDto> | undefined {
        return undefined;
      }
    }

    const schema = await generateSchema([TestOffsetConnectionTypeResolver]);
    expect(schema).toMatchSnapshot();
  });

  it('should throw an error if the object is not registered with @nestjs/graphql', () => {
    class TestBadDto {
      @Field()
      stringField!: string;
    }

    expect(() => getOrCreateOffsetConnectionType(TestBadDto, { pagingStrategy: PagingStrategies.OFFSET })).toThrow(
      'Unable to make OffsetConnectionType. Ensure TestBadDto is annotated with @nestjs/graphql @ObjectType',
    );
  });

  describe('limit offset offset connection', () => {
    const TestConnection = getOrCreateOffsetConnectionType(TestDto, { pagingStrategy: PagingStrategies.OFFSET });

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

      it('should pass additional query params to queryMany', async () => {
        const queryMany = jest.fn();
        const dtos = [createTestDTO(1), createTestDTO(2)];
        queryMany.mockResolvedValueOnce([...dtos]);
        await TestConnection.createFromPromise(queryMany, {
          search: 'searchString',
          paging: createPage({ limit: 2 }),
        });
        expect(queryMany).toHaveBeenCalledTimes(1);
        expect(queryMany).toHaveBeenCalledWith({ search: 'searchString', paging: { limit: 3, offset: 0 } });
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
