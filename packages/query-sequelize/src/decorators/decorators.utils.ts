import { Class } from '@nestjs-query/core';

export function getSequelizeQueryServiceKey<Entity>(entity: Class<Entity>): string {
  return `${entity.name}SequelizeQueryService`;
}
