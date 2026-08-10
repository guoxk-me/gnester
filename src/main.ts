import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureHttpApplication } from './bootstrap/http/configure-http-application';

const logger = new Logger('Bootstrap');

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const port = configureHttpApplication(app, {
    portConfigKey: 'PORT',
  });

  // AI modified: gateway and service processes now share Nest lifecycle shutdown behavior. / AI 修改：gateway 与 service 进程现共享 Nest 生命周期关闭行为。
  app.enableShutdownHooks();
  await app.listen(port);
  logger.log(`Application is running on port ${port}`);
}
bootstrap().catch((failure: unknown) => {
  logger.error(
    'Error during application bootstrap',
    failure instanceof Error ? failure.stack : String(failure),
  );
  // AI modified: orchestration must observe startup failure as a non-zero process result. / AI 修改：编排系统必须通过非零进程结果感知启动失败。
  process.exitCode = 1;
});
