import { Class, MetaValue, ValueReflector } from '@nestjs-query/core';
import { AuthorizerOptions, createDefaultAuthorizer, Authorizer } from '../auth';
import { AUTHORIZER_KEY } from './constants';

const reflector = new ValueReflector(AUTHORIZER_KEY);
export function Authorize<DTO>(
  optsOrAuthorizerOrClass: Class<Authorizer<DTO>> | Authorizer<DTO> | AuthorizerOptions<DTO>,
) {
  return (DTOClass: Class<DTO>) => {
    if ('authorize' in optsOrAuthorizerOrClass) {
      if ('authorizeRelation' in optsOrAuthorizerOrClass) {
        return reflector.set(DTOClass, optsOrAuthorizerOrClass);
      }
      return reflector.set(DTOClass, createDefaultAuthorizer(DTOClass, optsOrAuthorizerOrClass));
    }
    return reflector.set(DTOClass, optsOrAuthorizerOrClass);
  };
}

export const getAuthorizer = <DTO>(DTOClass: Class<DTO>): MetaValue<Class<Authorizer<DTO>>> => {
  return reflector.get(DTOClass);
};
