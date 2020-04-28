import { Inject } from '@nestjs/common';
import { Model, ModelCtor } from 'sequelize-typescript';
import { getSequelizeQueryServiceKey } from './decorators.utils';

export const InjectSequelizeQueryService = <Entity extends Model<Entity>>(
  entity: ModelCtor<Entity>,
): ParameterDecorator => Inject(getSequelizeQueryServiceKey(entity));
