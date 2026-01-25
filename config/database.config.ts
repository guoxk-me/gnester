import { registerAs } from '@nestjs/config';
import configuration from './configuration';
export default registerAs('database', () => {
  const db = configuration().db as {
    type: 'mysql' | 'postgres' | 'sqlite' | 'better-sqlite3' | 'mongodb';
    retryAttempts: number;
    retryDelay: number;
    autoLoadEntities: boolean;
  };
  return {
    type: db.type,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'test',
    // entities: [],
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    autoLoadEntities: db.autoLoadEntities,
    retryAttempts: db.retryAttempts || 10,
    retryDelay: db.retryDelay || 3000,
  };
});
