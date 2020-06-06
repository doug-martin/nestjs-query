import { Class } from '@nestjs-query/core';
import { PubSub } from 'graphql-subscriptions';
import { DTONamesOpts, getDTONames } from '../common';
import { GraphQLPubSub } from './pub-sub.interface';

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

let pubSub: GraphQLPubSub;
export const defaultPubSub = (): GraphQLPubSub => {
  if (!pubSub) {
    pubSub = new PubSub();
  }
  return pubSub;
};
