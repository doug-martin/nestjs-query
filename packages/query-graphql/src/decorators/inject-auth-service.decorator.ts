import { Class } from '@nestjs-query/core';
import { Inject } from '@nestjs/common';
import { getAuthServiceToken } from '../auth';

export const InjectAuthService = <DTO>(DTOClass: Class<DTO>) => Inject(getAuthServiceToken(DTOClass));
