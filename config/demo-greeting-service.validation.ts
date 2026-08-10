import { plainToInstance, Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  Min,
  validateSync,
} from 'class-validator';
import { Environment } from './config.types';
import { natsServerUrls } from './nats.validation';

export interface DemoGreetingServiceEnvironment {
  readonly NODE_ENV: Environment;
  readonly NATS_SERVERS: string[];
  readonly NATS_CONNECTION_TIMEOUT_MS: number;
  readonly DEMO_GREETING_NATS_QUEUE_GROUP: string;
  readonly DEMO_GREETING_NATS_GRACE_PERIOD_MS: number;
}

class DemoGreetingServiceEnvironmentVariables implements DemoGreetingServiceEnvironment {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsArray()
  @ArrayNotEmpty()
  @IsUrl(
    {
      require_tld: false,
      require_protocol: true,
      protocols: ['nats', 'tls'],
    },
    { each: true },
  )
  @Transform(({ value }) => natsServerUrls(value))
  @IsOptional()
  NATS_SERVERS: string[] = ['nats://127.0.0.1:4222'];

  @IsNumber()
  @Min(100)
  @Max(30_000)
  @IsOptional()
  NATS_CONNECTION_TIMEOUT_MS: number = 2000;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9._-]+$/u)
  @IsOptional()
  // AI modified: keep deployment queue names valid before the NATS driver starts. / AI 修改：在 NATS driver 启动前确保部署 queue 名称有效。
  DEMO_GREETING_NATS_QUEUE_GROUP: string = 'gnester.demo-greeting.v1';

  @IsNumber()
  @Min(0)
  @Max(30_000)
  @IsOptional()
  DEMO_GREETING_NATS_GRACE_PERIOD_MS: number = 1000;
}

export function validateDemoGreetingServiceConfig(
  config: Record<string, unknown>,
): DemoGreetingServiceEnvironment {
  const serviceConfig = plainToInstance(
    DemoGreetingServiceEnvironmentVariables,
    config,
    { enableImplicitConversion: true },
  );
  const errors = validateSync(serviceConfig, {
    skipMissingProperties: false,
  });

  // AI modified: each process fails only on configuration for capabilities it owns. / AI 修改：每个进程仅对其拥有能力的配置执行失败关闭。
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return serviceConfig;
}
