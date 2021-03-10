import { Class, MetaValue, ValueReflector } from '@nestjs-query/core';
import { KEY_SET_KEY } from './constants';

const reflector = new ValueReflector(KEY_SET_KEY);
export function KeySet<DTO>(keys: (keyof DTO)[]) {
  return (DTOClass: Class<DTO>): void => reflector.set(DTOClass, keys);
}

export const getKeySet = <DTO>(DTOClass: Class<DTO>): MetaValue<(keyof DTO)[]> => reflector.get(DTOClass, true);
