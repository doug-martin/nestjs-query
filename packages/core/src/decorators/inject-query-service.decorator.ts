import { Inject } from '@nestjs/common';
import { Class } from '../common';
import { getQueryServiceToken } from './helpers';

export const InjectQueryService = <DTO>(entity: Class<DTO>): ParameterDecorator => Inject(getQueryServiceToken(entity));
