import { Class } from '@nestjs-query/core';
import { Inject } from '@nestjs/common';
import { getTypeOrmQueryServiceKey } from './decorators.utils';

export const InjectTypeOrmQueryService = <Entity>(entity: Class<Entity>): ParameterDecorator =>
  Inject(getTypeOrmQueryServiceKey(entity));
