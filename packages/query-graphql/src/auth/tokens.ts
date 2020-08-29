import { Class } from '@nestjs-query/core';

export const getAuthorizerToken = <DTO>(DTOClass: Class<DTO>) => `${DTOClass.name}Authorizer`;
