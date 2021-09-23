import { Provider } from '@nestjs/common';
import { Class } from '@nestjs-query/core';
import { createDefaultAuthorizer, getAuthorizerToken, getCustomAuthorizerToken } from '../auth';
import { getAuthorizer, getCustomAuthorizer } from '../decorators';

function createServiceProvider<DTO>(DTOClass: Class<DTO>): Provider {
  const token = getAuthorizerToken(DTOClass);
  const authorizer = getAuthorizer(DTOClass);
  if (!authorizer) {
    // create default authorizer in case any relations have an authorizers
    return { provide: token, useClass: createDefaultAuthorizer(DTOClass, { authorize: () => ({}) }) };
  }
  return { provide: token, useClass: authorizer };
}

function createCustomAuthorizerProvider<DTO>(DTOClass: Class<DTO>): Provider | undefined {
  const token = getCustomAuthorizerToken(DTOClass);
  const customAuthorizer = getCustomAuthorizer(DTOClass);
  if (customAuthorizer) {
    return { provide: token, useClass: customAuthorizer };
  }
  return undefined;
}

export const createAuthorizerProviders = (DTOClasses: Class<unknown>[]): Provider[] =>
  DTOClasses.reduce<Provider[]>((providers, DTOClass) => {
    const p = createCustomAuthorizerProvider(DTOClass);
    if (p) providers.push(p);
    providers.push(createServiceProvider(DTOClass));
    return providers;
  }, []);
