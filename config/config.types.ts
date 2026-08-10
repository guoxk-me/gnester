export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Provision = 'provision',
}

export enum DbConnection {
  MYSQL = 'mysql',
  POSTGRES = 'postgres',
  SQLITE = 'sqlite',
  BETTER_SQLITE3 = 'better-sqlite3',
  MONGODB = 'mongodb',
}

export const SECONDARY_DATA_SOURCE = 'secondaryDataSource';
export const PRIMARY_MONGO_CONNECTION = 'primaryMongoConnection';
export const SECONDARY_MONGO_CONNECTION = 'secondaryMongoConnection';

export interface AppConfig {
  readonly name: string;
}

export interface CacheConfig {
  readonly ttl: number;
}

export interface YamlConfig {
  readonly app: AppConfig;
  readonly cache: CacheConfig;
}

export interface DatabaseOptions {
  readonly name?: string;
  readonly type: DbConnection;
  readonly host: string;
  readonly port: number;
  readonly username: string;
  readonly password: string;
  readonly database: string;
  readonly entities: string[];
  readonly migrations: string[];
  readonly synchronize: boolean;
  readonly autoLoadEntities: boolean;
  readonly retryAttempts: number;
  readonly retryDelay: number;
}

export interface MongoDatabaseOptions {
  readonly connectionName?: string;
  readonly uri: string;
  readonly dbName: string;
  readonly retryAttempts: number;
  readonly retryDelay: number;
  readonly autoCreate: boolean;
}
