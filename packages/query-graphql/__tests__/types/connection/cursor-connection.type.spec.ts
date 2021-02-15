// eslint-disable-next-line max-classes-per-file
import { Field, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { plainToClass } from 'class-transformer';
import { SortDirection } from '@nestjs-query/core';
import { ConnectionType, CursorPagingType, StaticConnectionType } from '../../../src';
import {
  cursorConnectionObjectTypeSDL,
  cursorConnectionObjectTypeWithTotalCountSDL,
  expectSDL,
} from '../../__fixtures__';
import { KeySet } from '../../../src/decorators';

describe('CursorConnectionType', (): void => {
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

  const createPage = (paging: CursorPagingType): CursorPagingType => plainToClass(CursorPagingType(), paging);

  const createTestDTO = (index: number): TestDto => ({
    stringField: `foo${index}`,
    numberField: index,
    boolField: index % 2 === 0,
  });

  it('should create the connection SDL', async () => {
    const TestConnection = ConnectionType(TestDto);
    @Resolver()
    class TestConnectionTypeResolver {
      @Query(() => TestConnection)
      test(): ConnectionType<TestDto> | undefined {
        return undefined;
      }
    }

    return expectSDL([TestConnectionTypeResolver], cursorConnectionObjectTypeSDL);
  });

  it('should create the connection SDL with totalCount if enabled', async () => {
    const TestConnectionWithTotalCount = ConnectionType(TestTotalCountDto, { enableTotalCount: true });
    @Resolver()
    class TestConnectionTypeResolver {
      @Query(() => TestConnectionWithTotalCount)
      test(): ConnectionType<TestTotalCountDto> | undefined {
        return undefined;
      }
    }

    return expectSDL([TestConnectionTypeResolver], cursorConnectionObjectTypeWithTotalCountSDL);
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

  describe('limit offset offset cursor connection', () => {
    const TestConnection = ConnectionType(TestDto);

    it('should create an empty connection when created with new', () => {
      expect(new TestConnection()).toEqual({
        pageInfo: { hasNextPage: false, hasPreviousPage: false },
        edges: [],
        totalCountFn: expect.any(Function),
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
          totalCountFn: expect.any(Function),
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
          totalCountFn: expect.any(Function),
        });
      });

      describe('with first', () => {
        it('should return hasNextPage and hasPreviousPage false when there are the exact number of records', async () => {
          const queryMany = jest.fn();
          const dtos = [createTestDTO(1), createTestDTO(2)];
          queryMany.mockResolvedValueOnce([...dtos]);
          const response = await TestConnection.createFromPromise(queryMany, { paging: createPage({ first: 2 }) });
          expect(queryMany).toHaveBeenCalledTimes(1);
          expect(queryMany).toHaveBeenCalledWith({ paging: { limit: 3, offset: 0 } });
          expect(response).toEqual({
            edges: [
              { cursor: 'YXJyYXljb25uZWN0aW9uOjA=', node: dtos[0] },
              { cursor: 'YXJyYXljb25uZWN0aW9uOjE=', node: dtos[1] },
            ],
            pageInfo: {
              endCursor: 'YXJyYXljb25uZWN0aW9uOjE=',
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
            },
            totalCountFn: expect.any(Function),
          });
        });

        it('should return hasNextPage true and hasPreviousPage false when the number of records more than the first', async () => {
          const queryMany = jest.fn();
          const dtos = [createTestDTO(1), createTestDTO(2), createTestDTO(3)];
          queryMany.mockResolvedValueOnce([...dtos]);
          const response = await TestConnection.createFromPromise(queryMany, { paging: createPage({ first: 2 }) });
          expect(queryMany).toHaveBeenCalledTimes(1);
          expect(queryMany).toHaveBeenCalledWith({ paging: { limit: 3, offset: 0 } });
          expect(response).toEqual({
            edges: [
              { cursor: 'YXJyYXljb25uZWN0aW9uOjA=', node: dtos[0] },
              { cursor: 'YXJyYXljb25uZWN0aW9uOjE=', node: dtos[1] },
            ],
            pageInfo: {
              endCursor: 'YXJyYXljb25uZWN0aW9uOjE=',
              hasNextPage: true,
              hasPreviousPage: false,
              startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
            },
            totalCountFn: expect.any(Function),
          });
        });
      });

      describe('with last', () => {
        it("should return hasPreviousPage false if paging backwards and we're on the first page", async () => {
          const queryMany = jest.fn();
          const dtos = [createTestDTO(1)];
          queryMany.mockResolvedValueOnce([...dtos]);
          const response = await TestConnection.createFromPromise(queryMany, {
            paging: createPage({ last: 2, before: 'YXJyYXljb25uZWN0aW9uOjE=' }),
          });
          expect(queryMany).toHaveBeenCalledTimes(1);
          expect(queryMany).toHaveBeenCalledWith({ paging: { limit: 1, offset: 0 } });
          expect(response).toEqual({
            edges: [{ cursor: 'YXJyYXljb25uZWN0aW9uOjA=', node: dtos[0] }],
            pageInfo: {
              endCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
              hasNextPage: true,
              hasPreviousPage: false,
              startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
            },
            totalCountFn: expect.any(Function),
          });
        });

        it('should return hasPreviousPage true if paging backwards and there is an additional node', async () => {
          const queryMany = jest.fn();
          const dtos = [createTestDTO(1), createTestDTO(2), createTestDTO(3)];
          queryMany.mockResolvedValueOnce([...dtos]);
          const response = await TestConnection.createFromPromise(queryMany, {
            paging: createPage({ last: 2, before: 'YXJyYXljb25uZWN0aW9uOjM=' }),
          });
          expect(queryMany).toHaveBeenCalledTimes(1);
          expect(queryMany).toHaveBeenCalledWith({ paging: { limit: 3, offset: 0 } });
          expect(response).toEqual({
            edges: [
              { cursor: 'YXJyYXljb25uZWN0aW9uOjE=', node: dtos[1] },
              { cursor: 'YXJyYXljb25uZWN0aW9uOjI=', node: dtos[2] },
            ],
            pageInfo: {
              endCursor: 'YXJyYXljb25uZWN0aW9uOjI=',
              hasNextPage: true,
              hasPreviousPage: true,
              startCursor: 'YXJyYXljb25uZWN0aW9uOjE=',
            },
            totalCountFn: expect.any(Function),
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
          totalCountFn: expect.any(Function),
        });
      });
    });
  });

  describe('keyset connection', () => {
    @ObjectType()
    @KeySet(['stringField'])
    class TestKeySetDTO extends TestDto {}
    function getConnectionType(): StaticConnectionType<TestKeySetDTO> {
      return ConnectionType(TestKeySetDTO);
    }

    it('should create an empty connection when created with new', () => {
      const CT = getConnectionType();
      expect(new CT()).toEqual({
        pageInfo: { hasNextPage: false, hasPreviousPage: false },
        edges: [],
        totalCountFn: expect.any(Function),
      });
    });

    describe('.createFromPromise', () => {
      it('should create a connections response with an empty query', async () => {
        const queryMany = jest.fn();
        const response = await getConnectionType().createFromPromise(queryMany, {});
        expect(queryMany).toHaveBeenCalledTimes(0);
        expect(response).toEqual({
          edges: [],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
          },
          totalCountFn: expect.any(Function),
        });
      });

      it('should create a connections response with an empty paging', async () => {
        const queryMany = jest.fn();
        const response = await getConnectionType().createFromPromise(queryMany, { paging: {} });
        expect(queryMany).toHaveBeenCalledTimes(0);
        expect(response).toEqual({
          edges: [],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
          },
          totalCountFn: expect.any(Function),
        });
      });

      describe('with first', () => {
        it('should return hasNextPage and hasPreviousPage false when there are the exact number of records', async () => {
          const queryMany = jest.fn();
          const dtos = [createTestDTO(1), createTestDTO(2)];
          queryMany.mockResolvedValueOnce([...dtos]);
          const response = await getConnectionType().createFromPromise(queryMany, { paging: createPage({ first: 2 }) });
          expect(queryMany).toHaveBeenCalledTimes(1);
          expect(queryMany).toHaveBeenCalledWith({
            filter: {},
            paging: { limit: 3 },
            sorting: [{ field: 'stringField', direction: SortDirection.ASC }],
          });
          expect(response).toEqual({
            edges: [
              {
                cursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6InN0cmluZ0ZpZWxkIiwidmFsdWUiOiJmb28xIn1dfQ==',
                node: dtos[0],
              },
              {
                cursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6InN0cmluZ0ZpZWxkIiwidmFsdWUiOiJmb28yIn1dfQ==',
                node: dtos[1],
              },
            ],
            pageInfo: {
              startCursor:
                'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6InN0cmluZ0ZpZWxkIiwidmFsdWUiOiJmb28xIn1dfQ==',
              endCursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6InN0cmluZ0ZpZWxkIiwidmFsdWUiOiJmb28yIn1dfQ==',
              hasNextPage: false,
              hasPreviousPage: false,
            },
            totalCountFn: expect.any(Function),
          });
        });

        it('should return hasNextPage true and hasPreviousPage false when the number of records more than the first', async () => {
          const queryMany = jest.fn();
          const dtos = [createTestDTO(1), createTestDTO(2), createTestDTO(3)];
          queryMany.mockResolvedValueOnce([...dtos]);
          const response = await getConnectionType().createFromPromise(queryMany, { paging: createPage({ first: 2 }) });
          expect(queryMany).toHaveBeenCalledTimes(1);
          expect(queryMany).toHaveBeenCalledWith({
            filter: {},
            paging: { limit: 3 },
            sorting: [{ field: 'stringField', direction: SortDirection.ASC }],
          });
          expect(response).toEqual({
            edges: [
              {
                cursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6InN0cmluZ0ZpZWxkIiwidmFsdWUiOiJmb28xIn1dfQ==',
                node: dtos[0],
              },
              {
                cursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6InN0cmluZ0ZpZWxkIiwidmFsdWUiOiJmb28yIn1dfQ==',
                node: dtos[1],
              },
            ],
            pageInfo: {
              startCursor:
                'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6InN0cmluZ0ZpZWxkIiwidmFsdWUiOiJmb28xIn1dfQ==',
              endCursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6InN0cmluZ0ZpZWxkIiwidmFsdWUiOiJmb28yIn1dfQ==',
              hasNextPage: true,
              hasPreviousPage: false,
            },
            totalCountFn: expect.any(Function),
          });
        });

        it('should fetch nodes after the cursor', async () => {
          const queryMany = jest.fn();
          const dtos = [createTestDTO(2), createTestDTO(3), createTestDTO(4)];
          queryMany.mockResolvedValueOnce([...dtos]);
          const response = await getConnectionType().createFromPromise(queryMany, {
            paging: createPage({
              first: 2,
              after: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6InN0cmluZ0ZpZWxkIiwidmFsdWUiOiJmb28xIn1dfQ==',
            }),
          });
          expect(queryMany).toHaveBeenCalledTimes(1);
          expect(queryMany).toHaveBeenCalledWith({
            filter: { or: [{ and: [{ stringField: { gt: 'foo1' } }] }] },
            paging: { limit: 3 },
            sorting: [{ field: 'stringField', direction: SortDirection.ASC }],
          });
          expect(response).toEqual({
            edges: [
              {
                cursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6InN0cmluZ0ZpZWxkIiwidmFsdWUiOiJmb28yIn1dfQ==',
                node: dtos[0],
              },
              {
                cursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6InN0cmluZ0ZpZWxkIiwidmFsdWUiOiJmb28zIn1dfQ==',
                node: dtos[1],
              },
            ],
            pageInfo: {
              startCursor:
                'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6InN0cmluZ0ZpZWxkIiwidmFsdWUiOiJmb28yIn1dfQ==',
              endCursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6InN0cmluZ0ZpZWxkIiwidmFsdWUiOiJmb28zIn1dfQ==',
              hasNextPage: true,
              hasPreviousPage: true,
            },
            totalCountFn: expect.any(Function),
          });
        });

        describe('with additional filter', () => {
          it('should merge the cursor filter and query filter', async () => {
            const queryMany = jest.fn();
            const dtos = [createTestDTO(2), createTestDTO(3), createTestDTO(4)];
            queryMany.mockResolvedValueOnce([...dtos]);
            const response = await getConnectionType().createFromPromise(queryMany, {
              filter: { boolField: { is: true } },
              paging: createPage({
                first: 2,
                after: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6InN0cmluZ0ZpZWxkIiwidmFsdWUiOiJmb28xIn1dfQ==',
              }),
            });
            expect(queryMany).toHaveBeenCalledTimes(1);
            expect(queryMany).toHaveBeenCalledWith({
              filter: { and: [{ or: [{ and: [{ stringField: { gt: 'foo1' } }] }] }, { boolField: { is: true } }] },
              paging: { limit: 3 },
              sorting: [{ field: 'stringField', direction: SortDirection.ASC }],
            });
            expect(response).toEqual({
              edges: [
                {
                  cursor:
                    'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6InN0cmluZ0ZpZWxkIiwidmFsdWUiOiJmb28yIn1dfQ==',
                  node: dtos[0],
                },
                {
                  cursor:
                    'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6InN0cmluZ0ZpZWxkIiwidmFsdWUiOiJmb28zIn1dfQ==',
                  node: dtos[1],
                },
              ],
              pageInfo: {
                startCursor:
                  'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6InN0cmluZ0ZpZWxkIiwidmFsdWUiOiJmb28yIn1dfQ==',
                endCursor:
                  'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6InN0cmluZ0ZpZWxkIiwidmFsdWUiOiJmb28zIn1dfQ==',
                hasNextPage: true,
                hasPreviousPage: true,
              },
              totalCountFn: expect.any(Function),
            });
          });
        });

        describe('with additional sorting', () => {
          it('should merge the cursor filter and query filter', async () => {
            const queryMany = jest.fn();
            const dtos = [createTestDTO(2), createTestDTO(3), createTestDTO(4)];
            queryMany.mockResolvedValueOnce([...dtos]);
            const response = await getConnectionType().createFromPromise(queryMany, {
              filter: { boolField: { is: true } },
              sorting: [{ field: 'boolField', direction: SortDirection.DESC }],
              paging: createPage({
                first: 2,
                after:
                  'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImJvb2xGaWVsZCIsInZhbHVlIjpmYWxzZX0seyJmaWVsZCI6InN0cmluZ0ZpZWxkIiwidmFsdWUiOiJmb28xIn1dfQ==',
              }),
            });
            expect(queryMany).toHaveBeenCalledTimes(1);
            expect(queryMany).toHaveBeenCalledWith({
              filter: {
                and: [
                  {
                    or: [
                      { and: [{ boolField: { lt: false } }] },
                      { and: [{ boolField: { eq: false } }, { stringField: { gt: 'foo1' } }] },
                    ],
                  },
                  { boolField: { is: true } },
                ],
              },
              paging: { limit: 3 },
              sorting: [
                { field: 'boolField', direction: SortDirection.DESC },
                { field: 'stringField', direction: SortDirection.ASC },
              ],
            });
            expect(response).toEqual({
              edges: [
                {
                  cursor:
                    'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImJvb2xGaWVsZCIsInZhbHVlIjp0cnVlfSx7ImZpZWxkIjoic3RyaW5nRmllbGQiLCJ2YWx1ZSI6ImZvbzIifV19',
                  node: dtos[0],
                },
                {
                  cursor:
                    'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImJvb2xGaWVsZCIsInZhbHVlIjpmYWxzZX0seyJmaWVsZCI6InN0cmluZ0ZpZWxkIiwidmFsdWUiOiJmb28zIn1dfQ==',
                  node: dtos[1],
                },
              ],
              pageInfo: {
                startCursor:
                  'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImJvb2xGaWVsZCIsInZhbHVlIjp0cnVlfSx7ImZpZWxkIjoic3RyaW5nRmllbGQiLCJ2YWx1ZSI6ImZvbzIifV19',
                endCursor:
                  'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImJvb2xGaWVsZCIsInZhbHVlIjpmYWxzZX0seyJmaWVsZCI6InN0cmluZ0ZpZWxkIiwidmFsdWUiOiJmb28zIn1dfQ==',
                hasNextPage: true,
                hasPreviousPage: true,
              },
              totalCountFn: expect.any(Function),
            });
          });
        });
      });

      describe('with last', () => {
        it("should return hasPreviousPage false if paging backwards and we're on the first page", async () => {
          const queryMany = jest.fn();
          const dtos = [createTestDTO(1)];
          queryMany.mockResolvedValueOnce([...dtos]);
          const response = await getConnectionType().createFromPromise(queryMany, {
            paging: createPage({
              last: 2,
              before: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6InN0cmluZ0ZpZWxkIiwidmFsdWUiOiJmb28yIn1dfQ==',
            }),
          });
          expect(queryMany).toHaveBeenCalledTimes(1);
          expect(queryMany).toHaveBeenCalledWith({
            filter: { or: [{ and: [{ stringField: { lt: 'foo2' } }] }] },
            paging: { limit: 3 },
            sorting: [{ field: 'stringField', direction: SortDirection.DESC, nulls: undefined }],
          });
          expect(response).toEqual({
            edges: [
              {
                cursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6InN0cmluZ0ZpZWxkIiwidmFsdWUiOiJmb28xIn1dfQ==',
                node: dtos[0],
              },
            ],
            pageInfo: {
              endCursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6InN0cmluZ0ZpZWxkIiwidmFsdWUiOiJmb28xIn1dfQ==',
              hasNextPage: true,
              hasPreviousPage: false,
              startCursor:
                'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6InN0cmluZ0ZpZWxkIiwidmFsdWUiOiJmb28xIn1dfQ==',
            },
            totalCountFn: expect.any(Function),
          });
        });

        it('should return hasPreviousPage true if paging backwards and there is an additional node', async () => {
          const queryMany = jest.fn();
          const dtos = [createTestDTO(1), createTestDTO(2), createTestDTO(3)];
          queryMany.mockResolvedValueOnce([...dtos].reverse());
          const response = await getConnectionType().createFromPromise(queryMany, {
            paging: createPage({
              last: 2,
              before: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6InN0cmluZ0ZpZWxkIiwidmFsdWUiOiJmb280In1dfQ==',
            }),
          });
          expect(queryMany).toHaveBeenCalledTimes(1);
          expect(queryMany).toHaveBeenCalledWith({
            filter: { or: [{ and: [{ stringField: { lt: 'foo4' } }] }] },
            paging: { limit: 3 },
            sorting: [{ field: 'stringField', direction: SortDirection.DESC, nulls: undefined }],
          });
          expect(response).toEqual({
            edges: [
              {
                cursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6InN0cmluZ0ZpZWxkIiwidmFsdWUiOiJmb28yIn1dfQ==',
                node: dtos[1],
              },
              {
                cursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6InN0cmluZ0ZpZWxkIiwidmFsdWUiOiJmb28zIn1dfQ==',
                node: dtos[2],
              },
            ],
            pageInfo: {
              startCursor:
                'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6InN0cmluZ0ZpZWxkIiwidmFsdWUiOiJmb28yIn1dfQ==',
              endCursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6InN0cmluZ0ZpZWxkIiwidmFsdWUiOiJmb28zIn1dfQ==',
              hasNextPage: true,
              hasPreviousPage: true,
            },
            totalCountFn: expect.any(Function),
          });
        });

        describe('with additional filter', () => {
          it('should merge the cursor filter and query filter', async () => {
            const queryMany = jest.fn();
            const dtos = [createTestDTO(1), createTestDTO(2), createTestDTO(3)];
            queryMany.mockResolvedValueOnce([...dtos].reverse());
            const response = await getConnectionType().createFromPromise(queryMany, {
              filter: { boolField: { is: true } },
              paging: createPage({
                last: 2,
                before: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6InN0cmluZ0ZpZWxkIiwidmFsdWUiOiJmb280In1dfQ==',
              }),
            });
            expect(queryMany).toHaveBeenCalledTimes(1);
            expect(queryMany).toHaveBeenCalledWith({
              filter: { and: [{ or: [{ and: [{ stringField: { lt: 'foo4' } }] }] }, { boolField: { is: true } }] },
              paging: { limit: 3 },
              sorting: [{ field: 'stringField', direction: SortDirection.DESC }],
            });
            expect(response).toEqual({
              edges: [
                {
                  cursor:
                    'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6InN0cmluZ0ZpZWxkIiwidmFsdWUiOiJmb28yIn1dfQ==',
                  node: dtos[1],
                },
                {
                  cursor:
                    'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6InN0cmluZ0ZpZWxkIiwidmFsdWUiOiJmb28zIn1dfQ==',
                  node: dtos[2],
                },
              ],
              pageInfo: {
                startCursor:
                  'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6InN0cmluZ0ZpZWxkIiwidmFsdWUiOiJmb28yIn1dfQ==',
                endCursor:
                  'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6InN0cmluZ0ZpZWxkIiwidmFsdWUiOiJmb28zIn1dfQ==',
                hasNextPage: true,
                hasPreviousPage: true,
              },
              totalCountFn: expect.any(Function),
            });
          });
        });

        describe('with additional sort', () => {
          it('should merge the cursor sort', async () => {
            const queryMany = jest.fn();
            const dtos = [createTestDTO(1), createTestDTO(2), createTestDTO(3)];
            queryMany.mockResolvedValueOnce([...dtos].reverse());
            const response = await getConnectionType().createFromPromise(queryMany, {
              filter: { boolField: { is: true } },
              sorting: [{ field: 'boolField', direction: SortDirection.DESC }],
              paging: createPage({
                last: 2,
                before:
                  'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImJvb2xGaWVsZCIsInZhbHVlIjp0cnVlfSx7ImZpZWxkIjoic3RyaW5nRmllbGQiLCJ2YWx1ZSI6ImZvbzQifV19',
              }),
            });
            expect(queryMany).toHaveBeenCalledTimes(1);
            expect(queryMany).toHaveBeenCalledWith({
              filter: {
                and: [
                  {
                    or: [
                      { and: [{ boolField: { gt: true } }] },
                      { and: [{ boolField: { eq: true } }, { stringField: { lt: 'foo4' } }] },
                    ],
                  },
                  { boolField: { is: true } },
                ],
              },
              paging: { limit: 3 },
              sorting: [
                { field: 'boolField', direction: SortDirection.ASC },
                { field: 'stringField', direction: SortDirection.DESC },
              ],
            });
            expect(response).toEqual({
              edges: [
                {
                  cursor:
                    'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImJvb2xGaWVsZCIsInZhbHVlIjp0cnVlfSx7ImZpZWxkIjoic3RyaW5nRmllbGQiLCJ2YWx1ZSI6ImZvbzIifV19',
                  node: dtos[1],
                },
                {
                  cursor:
                    'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImJvb2xGaWVsZCIsInZhbHVlIjpmYWxzZX0seyJmaWVsZCI6InN0cmluZ0ZpZWxkIiwidmFsdWUiOiJmb28zIn1dfQ==',
                  node: dtos[2],
                },
              ],
              pageInfo: {
                startCursor:
                  'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImJvb2xGaWVsZCIsInZhbHVlIjp0cnVlfSx7ImZpZWxkIjoic3RyaW5nRmllbGQiLCJ2YWx1ZSI6ImZvbzIifV19',
                endCursor:
                  'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImJvb2xGaWVsZCIsInZhbHVlIjpmYWxzZX0seyJmaWVsZCI6InN0cmluZ0ZpZWxkIiwidmFsdWUiOiJmb28zIn1dfQ==',
                hasNextPage: true,
                hasPreviousPage: true,
              },
              totalCountFn: expect.any(Function),
            });
          });
        });
      });

      it('should create an empty connection', async () => {
        const queryMany = jest.fn();
        queryMany.mockResolvedValueOnce([]);
        const response = await getConnectionType().createFromPromise(queryMany, {
          paging: createPage({ first: 2 }),
        });
        expect(queryMany).toHaveBeenCalledTimes(1);
        expect(queryMany).toHaveBeenCalledWith({
          filter: {},
          paging: { limit: 3 },
          sorting: [{ field: 'stringField', direction: SortDirection.ASC, nulls: undefined }],
        });
        expect(response).toEqual({
          edges: [],
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
