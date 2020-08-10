import { SequelizeModuleOptions } from '@nestjs/sequelize';
import { dbType } from './db-test.helpers';

export const sequelizeMysqlOptions = (
  username: string,
  database: string,
  overrides?: Partial<SequelizeModuleOptions>,
): SequelizeModuleOptions => {
  return {
    dialect: 'mysql',
    port: 3306,
    host: 'localhost',
    username,
    database,
    autoLoadModels: true,
    synchronize: true,
    ...overrides,
  };
};

export const sequelizePostgresOptions = (
  username: string,
  database: string,
  overrides?: Partial<SequelizeModuleOptions>,
): SequelizeModuleOptions => {
  return {
    dialect: 'postgres',
    port: 5436,
    host: 'localhost',
    username,
    database,
    autoLoadModels: true,
    synchronize: true,
    ...overrides,
  };
};

export const sequelizeOrmConfig = (
  username: string,
  database: string = username,
  overrides?: Partial<SequelizeModuleOptions>,
): SequelizeModuleOptions => {
  if (dbType === 'postgres') {
    return sequelizePostgresOptions(username, database, overrides);
  }
  return sequelizeMysqlOptions(username, database, overrides);
};
