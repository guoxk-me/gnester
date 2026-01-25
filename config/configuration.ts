import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as yaml from 'js-yaml';
import { plainToInstance } from 'class-transformer';
import { IsString, validateSync } from 'class-validator';

const YAML_CONFIG_FILENAME = 'config.yaml';

class YamlVariables {
  @IsString()
  test: string;
}

// 定义缓存变量

export default () => {
  const configYaml = readFileSync(
    join(__dirname, YAML_CONFIG_FILENAME),
    'utf8',
  );
  const config = yaml.load(configYaml) as Record<string, any>;
  // validate the configuration object 校验配置对象
  const validatedConfig = plainToInstance(YamlVariables, config, {
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
};
