import { Class, MetaValue, ValueReflector } from '@nestjs-query/core';
import { CRUDAuthService } from '../auth';
import { AUTH_SERVICE_KEY } from './constants';

const reflector = new ValueReflector(AUTH_SERVICE_KEY);
export function AuthorizationService<DTO>(DTOClass: Class<DTO>) {
  return (AuthService: Class<CRUDAuthService<DTO>>) => {
    reflector.set(DTOClass, AuthService);
  };
}

export const getAuthService = <DTO>(DTOClass: Class<DTO>): MetaValue<Class<CRUDAuthService<DTO>>> => {
  return reflector.get(DTOClass);
};
