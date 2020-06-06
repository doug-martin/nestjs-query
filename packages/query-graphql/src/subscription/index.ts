import { Class } from '@nestjs-query/core';
import { PubSub } from 'graphql-subscriptions';
import { DTONamesOpts, getDTONames } from '../common';

export { GraphQLPubSub } from './pub-sub.interface';

export enum EventType {
  CREATED = 'created',
  UPDATED_ONE = 'updatedOne',
  UPDATED_MANY = 'updatedMany',
  DELETED_ONE = 'deletedOne',
  DELETED_MANY = 'deletedMany',
}
export const getDTOEventName = <DTO>(type: EventType, DTOClass: Class<DTO>, opts?: DTONamesOpts): string => {
  const { baseName, pluralBaseName } = getDTONames(DTOClass, opts);
  if (type === EventType.DELETED_MANY || type === EventType.UPDATED_MANY) {
    return `${type}${pluralBaseName}`;
  }
  return `${type}${baseName}`;
};

export const pubSubToken = (): string => 'pub_sub';

let pubSub: PubSub;
export const defaultPubSub = (): PubSub => {
  if (!pubSub) {
    pubSub = new PubSub();
  }
  return pubSub;
};
