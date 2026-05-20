import { plainToInstance, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  validateSync,
} from 'class-validator';
import { DbConnection, Environment } from './config.types';

function parseBoolean(value: unknown): unknown {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }

  return value;
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  @Min(0)
  @Max(65535)
  PORT: number;

  @IsBoolean()
  @Transform(({ value }) => parseBoolean(value))
  @IsOptional()
  ENABLE_MULTI_DATABASE: boolean = false;

  @IsEnum(DbConnection)
  @IsOptional()
  PRIMARY_DB_TYPE: DbConnection = DbConnection.MYSQL;

  @IsEnum(DbConnection)
  @IsOptional()
  DB_TYPE: DbConnection = DbConnection.MYSQL;

  @IsString()
  @IsOptional()
  PRIMARY_DB_HOST: string;

  @IsString()
  @IsOptional()
  DB_HOST: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(65535)
  PRIMARY_DB_PORT: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(65535)
  DB_PORT: number;

  @IsString()
  @IsOptional()
  PRIMARY_DB_USERNAME: string;

  @IsString()
  @IsOptional()
  DB_USERNAME: string;

  @IsString()
  @IsOptional()
  PRIMARY_DB_PASSWORD: string;

  @IsString()
  @IsOptional()
  DB_PASSWORD: string;

  @IsString()
  @IsOptional()
  PRIMARY_DB_DATABASE: string;

  @IsString()
  @IsOptional()
  DB_DATABASE: string;

  @IsBoolean()
  @Transform(({ value }) => parseBoolean(value))
  @IsOptional()
  PRIMARY_DB_SYNCHRONIZE: boolean = false;

  @IsBoolean()
  @Transform(({ value }) => parseBoolean(value))
  @IsOptional()
  DB_SYNCHRONIZE: boolean = false;

  @IsBoolean()
  @Transform(({ value }) => parseBoolean(value))
  @IsOptional()
  PRIMARY_DB_AUTO_LOAD_ENTITIES: boolean = true;

  @IsBoolean()
  @Transform(({ value }) => parseBoolean(value))
  @IsOptional()
  DB_AUTO_LOAD_ENTITIES: boolean = true;

  @IsNumber()
  @IsOptional()
  PRIMARY_DB_RETRY_ATTEMPTS: number = 10;

  @IsNumber()
  @IsOptional()
  DB_RETRY_ATTEMPTS: number = 10;

  @IsNumber()
  @IsOptional()
  PRIMARY_DB_RETRY_DELAY: number = 3000;

  @IsNumber()
  @IsOptional()
  DB_RETRY_DELAY: number = 3000;

  @IsEnum(DbConnection)
  @IsOptional()
  SECONDARY_DB_TYPE: DbConnection = DbConnection.MYSQL;

  @IsString()
  @IsOptional()
  SECONDARY_DB_HOST: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(65535)
  SECONDARY_DB_PORT: number;

  @IsString()
  @IsOptional()
  SECONDARY_DB_USERNAME: string;

  @IsString()
  @IsOptional()
  SECONDARY_DB_PASSWORD: string;

  @IsString()
  @IsOptional()
  SECONDARY_DB_DATABASE: string;

  @IsBoolean()
  @Transform(({ value }) => parseBoolean(value))
  @IsOptional()
  SECONDARY_DB_SYNCHRONIZE: boolean = false;

  @IsBoolean()
  @Transform(({ value }) => parseBoolean(value))
  @IsOptional()
  SECONDARY_DB_AUTO_LOAD_ENTITIES: boolean = true;

  @IsNumber()
  @IsOptional()
  SECONDARY_DB_RETRY_ATTEMPTS: number = 10;

  @IsNumber()
  @IsOptional()
  SECONDARY_DB_RETRY_DELAY: number = 3000;

  @IsUrl({
    require_tld: false,
    require_protocol: true,
    protocols: ['redis', 'rediss'],
  })
  @IsOptional()
  REDIS_URL: string = 'redis://localhost:6379';
}

export function validate(
  config: Record<string, unknown>,
): EnvironmentVariables {
  // validate the configuration object 校验配置对象
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  // Don't skip missing fields(property) 不跳过缺失字段
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
