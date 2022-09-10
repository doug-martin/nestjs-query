import { Class, MetaValue, ValueReflector } from '@ptc-org/nestjs-query-core'

import { Authorizer, AuthorizerOptions, createDefaultAuthorizer, CustomAuthorizer } from '../auth'
import { AUTHORIZER_KEY, CUSTOM_AUTHORIZER_KEY } from './constants'

const reflector = new ValueReflector(AUTHORIZER_KEY)
const customAuthorizerReflector = new ValueReflector(CUSTOM_AUTHORIZER_KEY)

export function Authorize<DTO>(
  optsOrAuthorizerOrClass: Class<CustomAuthorizer<DTO>> | CustomAuthorizer<DTO> | AuthorizerOptions<DTO>
) {
  return (DTOClass: Class<DTO>): void => {
    if (!('authorize' in optsOrAuthorizerOrClass)) {
      // If the user provided a class, provide the custom authorizer and create a default authorizer that injects the custom authorizer
      customAuthorizerReflector.set(DTOClass, optsOrAuthorizerOrClass)
      return reflector.set(DTOClass, createDefaultAuthorizer(DTOClass))
    }
    return reflector.set(DTOClass, createDefaultAuthorizer(DTOClass, optsOrAuthorizerOrClass))
  }
}

export const getAuthorizer = <DTO>(DTOClass: Class<DTO>): MetaValue<Class<Authorizer<DTO>>> => reflector.get(DTOClass)
export const getCustomAuthorizer = <DTO>(DTOClass: Class<DTO>): MetaValue<Class<CustomAuthorizer<DTO>>> =>
  customAuthorizerReflector.get(DTOClass)
