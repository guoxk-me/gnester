import { registerAs } from '@nestjs/config';
import {
  MongoDatabaseOptions,
  SECONDARY_MONGO_CONNECTION,
} from './config.types';

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

function createMongoDataSourceOptions(prefix = 'MONGO'): MongoDatabaseOptions {
  const isProduction = process.env.NODE_ENV === 'production';
  const autoCreate = parseBoolean(getEnvValue(prefix, 'AUTO_CREATE'), true);

  return {
    uri: getEnvValue(prefix, 'URI') || 'mongodb://localhost:27017',
    dbName: getEnvValue(prefix, 'DATABASE') || 'gnester',
    retryAttempts: parseInt(getEnvValue(prefix, 'RETRY_ATTEMPTS') || '10', 10),
    retryDelay: parseInt(getEnvValue(prefix, 'RETRY_DELAY') || '3000', 10),
    autoCreate: !isProduction && autoCreate,
  };
}

export function createMongoOptions(): MongoDatabaseOptions {
  return createMongoDataSourceOptions();
}

export function createSecondaryMongoOptions(): MongoDatabaseOptions {
  return {
    ...createMongoDataSourceOptions('SECONDARY_MONGO'),
    connectionName: SECONDARY_MONGO_CONNECTION,
  };
}

export const primaryMongoConfig = registerAs(
  'mongodb.primary',
  createMongoOptions,
);

export const secondaryMongoConfig = registerAs(
  'mongodb.secondary',
  createSecondaryMongoOptions,
);
