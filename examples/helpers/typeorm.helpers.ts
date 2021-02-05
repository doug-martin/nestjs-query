import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { dbType } from './db-test.helpers';

export const typeormMysqlOptions = (
  username: string,
  database: string,
  overrides?: Partial<TypeOrmModuleOptions>,
): TypeOrmModuleOptions =>
  ({
    type: 'mysql',
    port: 3306,
    host: 'localhost',
    username,
    database,
    autoLoadEntities: true,
    synchronize: true,
    ...overrides,
  } as TypeOrmModuleOptions);

export const typeormPostgresOptions = (
  username: string,
  database: string,
  overrides?: Partial<TypeOrmModuleOptions>,
): TypeOrmModuleOptions =>
  ({
    type: 'postgres',
    port: 5436,
    host: 'localhost',
    username,
    database,
    autoLoadEntities: true,
    synchronize: true,
    ...overrides,
  } as TypeOrmModuleOptions);

export const typeormOrmConfig = (
  username: string,
  database: string = username,
  overrides?: Partial<TypeOrmModuleOptions>,
): TypeOrmModuleOptions => {
  if (dbType === 'postgres') {
    return typeormPostgresOptions(username, database, overrides);
  }
  return typeormMysqlOptions(username, database, overrides);
};
