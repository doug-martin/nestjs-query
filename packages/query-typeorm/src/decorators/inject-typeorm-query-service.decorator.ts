import { Class, getQueryServiceToken } from '@nestjs-query/core';
import { Inject } from '@nestjs/common';

export const InjectTypeOrmQueryService = <Entity>(entity: Class<Entity>): ParameterDecorator =>
  Inject(getQueryServiceToken(entity));
