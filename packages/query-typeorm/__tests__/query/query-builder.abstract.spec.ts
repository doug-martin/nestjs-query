import { Repository } from 'typeorm';
import { closeTestConnection, createTestConnection, getTestConnection } from '../__fixtures__/connection.fixture';
import { TestEntity } from '../__fixtures__/test.entity';
import { AbstractQueryBuilder } from '../../src/query/query-builder.abstract';

describe('AbstractQueryBuilder', (): void => {
  beforeEach(createTestConnection);
  afterEach(closeTestConnection);

  class TestAbstract<Entity> extends AbstractQueryBuilder<Entity> {
    constructor(readonly repo: Repository<Entity>) {
      super(repo);
    }
  }

  const getQueryBuilder = (): AbstractQueryBuilder<TestEntity> =>
    new TestAbstract(getTestConnection().getRepository(TestEntity));

  describe('#fieldToDbCol', () => {
    it('should convert the field to the correct db field on the entity', () => {
      expect(getQueryBuilder().fieldToDbCol('stringType')).toEqual('"string_type"');
    });

    it('should throw an error if the field is not on the entity', () => {
      // @ts-ignore
      expect(() => getQueryBuilder().fieldToDbCol('fooBar')).toThrow('Unknown column fooBar on table test_entity');
    });
  });
});
