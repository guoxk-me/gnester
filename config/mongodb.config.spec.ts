import {
  createMongoOptions,
  createSecondaryMongoOptions,
} from './mongodb.config';
import { SECONDARY_MONGO_CONNECTION } from './config.types';

describe('mongodbConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { NODE_ENV: 'development' };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('creates primary Mongo options from MONGO_* environment variables', () => {
    process.env.MONGO_URI = 'mongodb://localhost:27017';
    process.env.MONGO_DATABASE = 'gnester';
    process.env.MONGO_RETRY_ATTEMPTS = '4';
    process.env.MONGO_RETRY_DELAY = '500';

    const config = createMongoOptions();

    expect(config).toEqual(
      expect.objectContaining({
        uri: 'mongodb://localhost:27017',
        dbName: 'gnester',
        retryAttempts: 4,
        retryDelay: 500,
        autoCreate: true,
      }),
    );
  });

  it('keeps automatic collection creation disabled in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.MONGO_AUTO_CREATE = 'true';

    const config = createMongoOptions();

    expect(config.autoCreate).toBe(false);
  });

  it('creates a named secondary Mongo connection', () => {
    process.env.SECONDARY_MONGO_URI = 'mongodb://secondary-host:27017';
    process.env.SECONDARY_MONGO_DATABASE = 'gnester_audit';

    const config = createSecondaryMongoOptions();

    expect(config.connectionName).toBe(SECONDARY_MONGO_CONNECTION);
    expect(config.uri).toBe('mongodb://secondary-host:27017');
    expect(config.dbName).toBe('gnester_audit');
  });
});
