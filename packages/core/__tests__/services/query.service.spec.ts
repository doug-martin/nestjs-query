/* eslint-disable @typescript-eslint/no-unused-vars */
import * as nestjsCommon from '@nestjs/common';
import {
  Class,
  DeepPartial,
  DeleteManyResponse,
  Filter,
  getQueryServiceDTO,
  Query,
  QueryService,
  UpdateManyResponse,
} from '../../src';

describe('query service', () => {
  const injectableSpy = jest.spyOn(nestjsCommon, 'Injectable');

  class TestDTO {
    foo!: string;
  }

  const testDTO = { foo: 'bar' };
  const promiseDTO = Promise.resolve(testDTO);
  const promiseManyDTO = Promise.resolve([testDTO]);

  class TestQueryService implements QueryService<TestDTO> {
    addRelations<Relation>(
      relationName: string,
      id: string | number,
      relationIds: (string | number)[],
    ): Promise<TestDTO> {
      return promiseDTO;
    }

    createMany<C extends DeepPartial<TestDTO>>(items: C[]): Promise<TestDTO[]> {
      return promiseManyDTO;
    }

    createOne<C extends DeepPartial<TestDTO>>(item: C): Promise<TestDTO> {
      return promiseDTO;
    }

    deleteMany(filter: Filter<TestDTO>): Promise<DeleteManyResponse> {
      return Promise.resolve({ deletedCount: 0 });
    }

    deleteOne(id: number | string): Promise<TestDTO> {
      return promiseDTO;
    }

    findById(id: string | number): Promise<TestDTO | undefined> {
      return promiseDTO;
    }

    findRelation<Relation>(
      RelationClass: Class<Relation>,
      relationName: string,
      entity: TestDTO,
    ): Promise<Relation | undefined> {
      return Promise.resolve(undefined);
    }

    getById(id: string | number): Promise<TestDTO> {
      return promiseDTO;
    }

    query(query: Query<TestDTO>): Promise<TestDTO[]> {
      return promiseManyDTO;
    }

    queryRelations<Relation>(
      RelationClass: Class<Relation>,
      relationName: string,
      entity: TestDTO,
      query: Query<Relation>,
    ): Promise<Relation[]> {
      return Promise.resolve([]);
    }

    removeRelation<Relation>(relationName: string, id: string | number, relationId: string | number): Promise<TestDTO> {
      return promiseDTO;
    }

    removeRelations<Relation>(
      relationName: string,
      id: string | number,
      relationIds: (string | number)[],
    ): Promise<TestDTO> {
      return promiseDTO;
    }

    setRelation<Relation>(relationName: string, id: string | number, relationId: string | number): Promise<TestDTO> {
      return promiseDTO;
    }

    updateMany<U extends DeepPartial<TestDTO>>(update: U, filter: Filter<TestDTO>): Promise<UpdateManyResponse> {
      return Promise.resolve({ updatedCount: 1 });
    }

    updateOne<U extends DeepPartial<TestDTO>>(id: string | number, update: U): Promise<TestDTO> {
      return promiseDTO;
    }
  }

  beforeEach(() => jest.clearAllMocks());
  it('should register a query service as injectable and register with metadata', () => {
    @QueryService(TestDTO)
    class TestService extends TestQueryService {}
    expect(injectableSpy).toBeCalledTimes(1);
    expect(getQueryServiceDTO(TestService)).toBe(TestDTO);
  });

  describe('getQueryServiceDTO', () => {
    it('should return undefined if the service is not registered', () => {
      expect(getQueryServiceDTO(TestQueryService)).toBeUndefined();
    });
  });
});
