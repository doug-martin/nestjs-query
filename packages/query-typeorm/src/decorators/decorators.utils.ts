import { Class } from '@nestjs-query/core';

export function getTypeOrmQueryServiceKey<Entity>(entity: Class<Entity>): string {
  return `${entity.name}TypeOrmQueryService`;
}
