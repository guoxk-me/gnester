import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as yaml from 'js-yaml';
import { plainToInstance, Type } from 'class-transformer';
import { IsBoolean, IsInt, ValidateNested, validateSync } from 'class-validator';

const YAML_CONFIG_FILENAME = 'config.yaml';

class  DatabaseConfig {
  @IsInt()
  retryAttempts: number;

  @IsInt()
  retryDelay: number;

  @IsBoolean()
  autoLoadEntities: boolean;
}

class EnvironmentVariables {

  @ValidateNested()
  @Type(() => DatabaseConfig)
  db:DatabaseConfig;
}

export default () => {
  const config =  readFileSync(join(__dirname, YAML_CONFIG_FILENAME), 'utf8')
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

  return yaml.load(
    config
  ) as Record<string, any>;
};
