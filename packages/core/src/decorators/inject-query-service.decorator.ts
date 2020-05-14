import { Inject } from '@nestjs/common';
import { Class } from '../common';
import { getQueryServiceToken } from './helpers';

export const InjectQueryService = <DTO, Entity>(DTOClass: Class<DTO>): ParameterDecorator =>
  Inject(getQueryServiceToken(DTOClass));
