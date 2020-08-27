import { Provider } from '@nestjs/common';
import { Class } from '@nestjs-query/core';
import { createDefaultCRUDAuthService, getAuthServiceToken } from '../auth';
import { getAuthService } from '../decorators';

function createServiceProvider<DTO>(DTOClass: Class<DTO>): Provider {
  return {
    provide: getAuthServiceToken(DTOClass),
    useClass: getAuthService(DTOClass) ?? createDefaultCRUDAuthService(DTOClass),
  };
}

export const createAuthServiceProviders = (opts: Class<unknown>[]): Provider[] => {
  return opts.map((opt) => createServiceProvider(opt));
};
