// Declaration merging to extend the built in comparison operations
import { TestEntity } from './test.entity';
import { Filter } from '@nestjs-query/core';

// Declaration merging to enhance global type-based filters
declare module '@nestjs-query/core' {
  interface CommonFieldComparisonType<FieldType> {
    isMultipleOf?: FieldType extends Date ? number : FieldType;
  }
}

// Concrete Entity filter types, extended with virtual property filters
export type TestEntityFilter = Filter<
  TestEntity,
  {
    fakePointType?: { distanceFrom?: { point: { lat: number; lng: number }; radius: number } };
    pendingTestRelations?: { gt?: number };
  }
>;
