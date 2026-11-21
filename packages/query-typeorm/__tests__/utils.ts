import { Connection } from 'typeorm';
import { CustomFilterRegistry } from '../src/query';
import {
  IsMultipleOfCustomFilter,
  IsMultipleOfDateCustomFilter,
  RadiusCustomFilter,
  TestEntityTestRelationCountFilter,
} from './__fixtures__/custom-filters.services';
import { TestEntity } from './__fixtures__/test.entity';

export function getCustomFilterRegistry(connection: Connection): CustomFilterRegistry {
  const customFilterRegistry = new CustomFilterRegistry();
  // Test for (type, operation) filter registration (this is valid for all fields of all entities)
  customFilterRegistry.setFilter(new IsMultipleOfCustomFilter(), IsMultipleOfCustomFilter);
  // Test for (type, operation) filter on another type
  customFilterRegistry.setFilter(new IsMultipleOfDateCustomFilter(), IsMultipleOfDateCustomFilter);
  // Test for (class, field, operation) filter on a virtual property 'fakePointType' that does not really exist on the entity
  customFilterRegistry.setFilter(new RadiusCustomFilter(), {
    klass: TestEntity,
    field: 'fakePointType',
    operations: RadiusCustomFilter.operations,
  });
  // Test for (class, field, operation) filter with a complex subquery
  customFilterRegistry.setFilter(new TestEntityTestRelationCountFilter(connection.createEntityManager()), {
    klass: TestEntity,
    field: 'pendingTestRelations',
    operations: ['gt'],
  });
  return customFilterRegistry;
}
