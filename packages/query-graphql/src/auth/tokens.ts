import { Class } from '@ptc/nestjs-query-core';

export const getAuthorizerToken = <DTO>(DTOClass: Class<DTO>): string => `${DTOClass.name}Authorizer`;
export const getCustomAuthorizerToken = <DTO>(DTOClass: Class<DTO>): string => `${DTOClass.name}CustomAuthorizer`;
