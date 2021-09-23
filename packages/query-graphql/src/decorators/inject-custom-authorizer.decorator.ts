import { Class } from '@nestjs-query/core';
import { Inject } from '@nestjs/common';
import { getCustomAuthorizerToken } from '../auth';

export const InjectCustomAuthorizer = <DTO>(DTOClass: Class<DTO>): ParameterDecorator =>
  Inject(getCustomAuthorizerToken(DTOClass));
