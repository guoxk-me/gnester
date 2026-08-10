import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Environment } from 'config/config.types';

export interface HttpApplicationOptions {
  readonly portConfigKey: 'PORT';
}

// AI modified: keep shared HTTP validation and versioning policy behind one process bootstrap interface. / AI 修改：将共享 HTTP 校验与版本策略收敛到单一进程启动接口之后。
export function configureHttpApplication(
  app: INestApplication,
  options: HttpApplicationOptions,
): number {
  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<Environment>(
    'NODE_ENV',
    Environment.Development,
  );
  const port = configService.getOrThrow<number>(options.portConfigKey);

  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: nodeEnv === Environment.Production,
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
    defaultVersion: '1',
  });

  return port;
}
