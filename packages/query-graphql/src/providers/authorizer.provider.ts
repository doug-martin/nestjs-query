import { Provider } from '@nestjs/common';
import { Class } from '@nestjs-query/core';
import { createDefaultAuthorizer, getAuthorizerToken } from '../auth';
import { getAuthorizer } from '../decorators';

function createServiceProvider<DTO>(DTOClass: Class<DTO>): Provider {
  const token = getAuthorizerToken(DTOClass);
  const authorizer = getAuthorizer(DTOClass);
  if (!authorizer) {
    // create default authorizer in case any relations have an authorizers
    return { provide: token, useClass: createDefaultAuthorizer(DTOClass, { authorize: () => ({}) }) };
  }
  return { provide: token, useClass: authorizer };
}

export const createAuthorizerProviders = (DTOClasses: Class<unknown>[]): Provider[] => {
  return DTOClasses.map((DTOClass) => createServiceProvider(DTOClass));
};
