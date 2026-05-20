import { registerAs } from '@nestjs/config';
import {
  DatabaseOptions,
  DbConnection,
  SECONDARY_DATA_SOURCE,
} from './config.types';

const RUNTIME_ENTITY_GLOBS = ['dist/**/*.entity.js'];
const RUNTIME_MIGRATION_GLOBS = ['dist/migrations/*.js'];
const CLI_ENTITY_GLOBS = ['src/**/*.entity.ts', ...RUNTIME_ENTITY_GLOBS];
const CLI_MIGRATION_GLOBS = ['src/migrations/*.ts', ...RUNTIME_MIGRATION_GLOBS];

function parseBoolean(
  value: string | undefined,
  defaultValue: boolean,
): boolean {
  if (value === undefined) {
    return defaultValue;
  }

  return value.toLowerCase() === 'true';
}

function getEnvValue(prefix: string, key: string): string | undefined {
  return process.env[`${prefix}_${key}`];
}

function getPrimaryEnvValue(key: string): string | undefined {
  return getEnvValue('PRIMARY_DB', key) ?? getEnvValue('DB', key);
}

function getDataSourceEnvValue(
  prefix: string,
  key: string,
): string | undefined {
  return prefix === 'PRIMARY_DB'
    ? getPrimaryEnvValue(key)
    : getEnvValue(prefix, key);
}

function createDataSourceOptions(prefix = 'PRIMARY_DB'): DatabaseOptions {
  const isProduction = process.env.NODE_ENV === 'production';
  const synchronize = parseBoolean(
    getDataSourceEnvValue(prefix, 'SYNCHRONIZE'),
    false,
  );
  const type = (getDataSourceEnvValue(prefix, 'TYPE') ||
    DbConnection.MYSQL) as DbConnection;
  return {
    type,
    host: getDataSourceEnvValue(prefix, 'HOST') || 'localhost',
    port: parseInt(getDataSourceEnvValue(prefix, 'PORT') || '3306', 10),
    username: getDataSourceEnvValue(prefix, 'USERNAME') || 'root',
    password: getDataSourceEnvValue(prefix, 'PASSWORD') || '',
    database: getDataSourceEnvValue(prefix, 'DATABASE') || 'test',
    entities: RUNTIME_ENTITY_GLOBS,
    migrations: RUNTIME_MIGRATION_GLOBS,
    synchronize: !isProduction && synchronize,
    autoLoadEntities: parseBoolean(
      getDataSourceEnvValue(prefix, 'AUTO_LOAD_ENTITIES'),
      true,
    ),
    retryAttempts: parseInt(
      getDataSourceEnvValue(prefix, 'RETRY_ATTEMPTS') || '10',
      10,
    ),
    retryDelay: parseInt(
      getDataSourceEnvValue(prefix, 'RETRY_DELAY') || '3000',
      10,
    ),
  };
}

export function createDatabaseOptions(): DatabaseOptions {
  return createDataSourceOptions();
}

export function createDatabaseCliOptions(): DatabaseOptions {
  return {
    ...createDataSourceOptions(),
    entities: CLI_ENTITY_GLOBS,
    migrations: CLI_MIGRATION_GLOBS,
  };
}

export function createSecondaryDatabaseOptions(): DatabaseOptions {
  return {
    ...createDataSourceOptions('SECONDARY_DB'),
    name: SECONDARY_DATA_SOURCE,
  };
}

export function createSecondaryDatabaseCliOptions(): DatabaseOptions {
  return {
    ...createSecondaryDatabaseOptions(),
    entities: CLI_ENTITY_GLOBS,
    migrations: CLI_MIGRATION_GLOBS,
  };
}

export const primaryDatabaseConfig = registerAs(
  'database.primary',
  createDatabaseOptions,
);

export const secondaryDatabaseConfig = registerAs(
  'database.secondary',
  createSecondaryDatabaseOptions,
);
