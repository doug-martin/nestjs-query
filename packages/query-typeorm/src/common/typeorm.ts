import { Class } from '@nestjs-query/core';
import { ColumnType, Connection, ConnectionOptions, getConnection } from 'typeorm';

interface QueryTypeormPropertyMetadata {
  metaType: 'property';
  type: ColumnType;
}

interface QueryTypeormRelationMetadata {
  metaType: 'relation';
  type: Class<unknown>;
}

export type QueryTypeormEntityMetadata<T = unknown> = Record<
  keyof T | string,
  QueryTypeormPropertyMetadata | QueryTypeormRelationMetadata
>;
export type QueryTypeormMetadata = Map<Class<unknown>, QueryTypeormEntityMetadata>;

export function buildQueryTypeormMetadata(connection: Connection): QueryTypeormMetadata {
  const meta: QueryTypeormMetadata = new Map();
  for (const entity of connection.entityMetadatas) {
    const entityMeta: QueryTypeormEntityMetadata = {};
    for (const field of [...entity.ownColumns]) {
      entityMeta[field.propertyName] = {
        metaType: 'property',
        type: field.type,
      };
    }
    for (const field of [...entity.ownRelations]) {
      // Skip strings
      if (typeof field.inverseEntityMetadata.target === 'function') {
        entityMeta[field.propertyName] = {
          metaType: 'relation',
          type: field.inverseEntityMetadata.target as Class<unknown>,
        };
      }
    }

    // Ignore things like junction tables
    if (typeof entity.target === 'string') {
      continue;
    }
    meta.set(entity.target as Class<unknown>, entityMeta);
  }
  return meta;
}

function getConnectionFromOpts(connection?: Connection | ConnectionOptions | string): Connection {
  if (!connection) {
    return getConnection('default');
  }
  if (typeof connection === 'string') {
    return getConnection(connection);
  }
  if (!connection.name) {
    return getConnection('default');
  }
  return connection as Connection;
}

const cache = new Map<Connection, QueryTypeormMetadata>();

export function getQueryTypeormMetadata(
  connectionOpts?: Connection | ConnectionOptions | string,
): QueryTypeormMetadata {
  const connection = getConnectionFromOpts(connectionOpts);

  let meta = cache.get(connection);
  if (!meta) {
    meta = buildQueryTypeormMetadata(connection);
    cache.set(connection, meta);
  }
  return meta;
}
