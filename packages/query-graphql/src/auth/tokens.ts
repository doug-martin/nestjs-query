import { Class } from '@nestjs-query/core';

export const getAuthServiceToken = <DTO>(DTOClass: Class<DTO>) => `${DTOClass.name}CRUDAuthService`;
