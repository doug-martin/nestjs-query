import { getQueryServiceToken } from '@nestjs-query/core';
import { Inject } from '@nestjs/common';
import { Model, ModelCtor } from 'sequelize-typescript';

export const InjectSequelizeQueryService = <Entity extends Model<Entity>>(
  entity: ModelCtor<Entity>,
): ParameterDecorator => Inject(getQueryServiceToken(entity));
