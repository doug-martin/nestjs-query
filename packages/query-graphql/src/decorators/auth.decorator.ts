import { Class, MetaValue, classMetadataDecorator, getClassMetadata } from '@nestjs-query/core';
import { AUTH_KEY } from './constants';
import { CRUDAuthOptions } from '../auth';

export const CRUDAuth = classMetadataDecorator<CRUDAuthOptions<any>>(AUTH_KEY);

export const getCRUDAuth = <DTO>(Cls: Class<DTO>): MetaValue<CRUDAuthOptions<DTO>> => {
  return getClassMetadata(Cls, AUTH_KEY);
};
