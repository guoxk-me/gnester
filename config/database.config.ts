import { registerAs } from '@nestjs/config';
import { DbConnection } from './config.enums';

export default registerAs('database', () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const synchronize = process.env.DB_SYNCHRONIZE === 'true';

  return {
    type: (process.env.DB_TYPE || 'mysql') as DbConnection,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'test',
    // entities: [],
    synchronize: !isProduction && synchronize,
    autoLoadEntities: process.env.DB_AUTO_LOAD_ENTITIES === 'true',
    retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS || '10', 10),
    retryDelay: parseInt(process.env.DB_RETRY_DELAY || '3000', 10),
  };
});
