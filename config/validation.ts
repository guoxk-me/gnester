import { plainToInstance } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';
import { DbConnection, Environment } from './config.enums';

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  @Min(0)
  @Max(65535)
  PORT: number;

  @IsEnum(DbConnection)
  @IsOptional()
  DB_TYPE: DbConnection = DbConnection.MYSQL;

  @IsString()
  @IsOptional()
  DB_HOST: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(65535)
  DB_PORT: number;

  @IsString()
  @IsOptional()
  DB_USERNAME: string;

  @IsString()
  @IsOptional()
  DB_PASSWORD: string;

  @IsString()
  @IsOptional()
  DB_DATABASE: string;

  @IsString()
  @IsOptional()
  DB_SYNCHRONIZE?: string;

  @IsBoolean()
  @IsOptional()
  DB_AUTO_LOAD_ENTITIES: boolean = true;

  @IsNumber()
  @IsOptional()
  DB_RETRY_ATTEMPTS: number = 10;

  @IsNumber()
  @IsOptional()
  DB_RETRY_DELAY: number = 3000;
}

export function validate(config: Record<string, unknown>) {
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
