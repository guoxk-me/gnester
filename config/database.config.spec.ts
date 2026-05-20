import {
  createDatabaseOptions,
  createSecondaryDatabaseOptions,
} from './database.config';
import { DbConnection, SECONDARY_DATA_SOURCE } from './config.types';

describe('databaseConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { NODE_ENV: 'development' };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('enables auto-loaded entities by default', () => {
    const config = createDatabaseOptions();

    expect(config.autoLoadEntities).toBe(true);
  });

  it('keeps synchronize disabled in production even when requested', () => {
    process.env.NODE_ENV = 'production';
    process.env.DB_SYNCHRONIZE = 'true';

    const config = createDatabaseOptions();

    expect(config.synchronize).toBe(false);
  });

  it('keeps TypeScript entity and migration globs out of runtime options', () => {
    const config = createDatabaseOptions();

    expect(config.entities).toEqual(['dist/**/*.entity.js']);
    expect(config.migrations).toEqual(['dist/migrations/*.js']);
  });

  it('creates a named secondary data source with the shared database builder', () => {
    process.env.SECONDARY_DB_HOST = 'secondary-db';
    process.env.SECONDARY_DB_DATABASE = 'gnester_secondary';
    process.env.SECONDARY_DB_TYPE = 'postgres';

    const config = createSecondaryDatabaseOptions();

    expect(config.name).toBe(SECONDARY_DATA_SOURCE);
    expect(config.type).toBe(DbConnection.POSTGRES);
    expect(config.host).toBe('secondary-db');
    expect(config.database).toBe('gnester_secondary');
    expect(config.autoLoadEntities).toBe(true);
  });
});
