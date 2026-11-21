import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColumnType } from 'typeorm';
import { NestjsQueryTypeOrmModule } from '../../src';
import { CustomFilterRegistry, CustomFilterResult } from '../../src/query';
import { closeTestConnection, CONNECTION_OPTIONS, refresh } from '../__fixtures__/connection.fixture';
import {
  IsMultipleOfCustomFilter,
  IsMultipleOfDateCustomFilter,
  RadiusCustomFilter,
  TestEntityTestRelationCountFilter,
} from '../__fixtures__/custom-filters.services';
import { TestEntityRelationEntity } from '../__fixtures__/test-entity-relation.entity';
import { TestRelation } from '../__fixtures__/test-relation.entity';
import { TestSoftDeleteEntity } from '../__fixtures__/test-soft-delete.entity';
import { TestEntity } from '../__fixtures__/test.entity';

describe('CustomFilterRegistry', (): void => {
  let moduleRef: TestingModule;

  afterEach(() => closeTestConnection());

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(CONNECTION_OPTIONS),
        // Use the full module so we can test custom filters well
        NestjsQueryTypeOrmModule.forFeature(
          [TestEntity, TestRelation, TestEntityRelationEntity, TestSoftDeleteEntity],
          undefined,
          {
            providers: [
              // Custom filters
              IsMultipleOfCustomFilter,
              IsMultipleOfDateCustomFilter,
              RadiusCustomFilter,
              TestEntityTestRelationCountFilter,
            ],
          },
        ),
      ],
      providers: [],
    }).compile();
    // Trigger onModuleInit()
    await moduleRef.init();
    await refresh();
  });

  describe('#standalone', () => {
    it('Test for errors', () => {
      const cf = new CustomFilterRegistry();
      const filter = {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        apply(field: string, cmp: string, val: unknown, alias?: string): CustomFilterResult {
          return { sql: '', params: {} };
        },
      };
      expect(() => cf.setFilter(filter, { types: [], operations: ['testOperation'] })).toThrow(
        'Cannot register a (type) filter without types, please define the types array',
      );
      expect(() => cf.setFilter(filter, { types: ['number'], operations: [] })).toThrow(
        'Cannot register a filter without operations, please define the operations array',
      );
    });
  });

  describe('#custom-filters', () => {
    it('Verify that custom filters are registered', () => {
      const customFilterRegistry = moduleRef.get(CustomFilterRegistry);
      expect(customFilterRegistry).toBeDefined();
      expect(customFilterRegistry.getFilter('isMultipleOf')).toBeUndefined();

      // Test for 2 different property type based filters
      for (const type of ['integer', Number] as ColumnType[]) {
        expect(customFilterRegistry.getFilter('isMultipleOf', type)).toBeInstanceOf(IsMultipleOfCustomFilter);
        expect(customFilterRegistry.getFilter('isMultipleOf', type, TestEntity)).toBeInstanceOf(
          IsMultipleOfCustomFilter,
        );
        expect(customFilterRegistry.getFilter('isMultipleOf', type, TestEntity, 'numberType')).toBeInstanceOf(
          IsMultipleOfCustomFilter,
        );
      }

      for (const type of ['date', 'datetime', Date] as ColumnType[]) {
        expect(customFilterRegistry.getFilter('isMultipleOf', type)).toBeDefined();
        expect(customFilterRegistry.getFilter('isMultipleOf', type, TestEntity)).toBeInstanceOf(
          IsMultipleOfDateCustomFilter,
        );
        expect(customFilterRegistry.getFilter('isMultipleOf', type, TestEntity, 'dateType')).toBeInstanceOf(
          IsMultipleOfDateCustomFilter,
        );
      }

      // Test for (class, field, entity) filter
      expect(customFilterRegistry.getFilter('distanceFrom', undefined, TestEntity, 'fakePointType')).toBeInstanceOf(
        RadiusCustomFilter,
      );
      expect(customFilterRegistry.getFilter('gt', undefined, TestEntity, 'pendingTestRelations')).toBeInstanceOf(
        TestEntityTestRelationCountFilter,
      );
    });
  });
});
