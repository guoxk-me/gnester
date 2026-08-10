import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { validateDemoGreetingServiceConfig } from 'config/demo-greeting-service.validation';
import { loadProjectEnvironmentFiles } from 'config/environment-files';
import { configureDemoGreetingService } from './configure-demo-greeting-service';
import { DemoGreetingServiceAppModule } from './demo-greeting-service.module';
import { demoGreetingServiceOptions } from './demo-greeting-service.options';

const logger = new Logger('DemoGreetingServiceBootstrap');

async function bootstrap(): Promise<void> {
  // AI modified: transport options are needed before Nest creates ConfigModule, so preload the same validated dotenv precedence. / AI 修改：Nest 创建 ConfigModule 前就需要 transport 选项，因此预加载相同且经过校验的 dotenv 优先级。
  loadProjectEnvironmentFiles();
  const serviceEnvironment = validateDemoGreetingServiceConfig(process.env);
  const app = await NestFactory.createMicroservice(
    DemoGreetingServiceAppModule,
    demoGreetingServiceOptions(serviceEnvironment),
  );

  configureDemoGreetingService(app);

  // AI modified: let the process drain through Nest lifecycle hooks before exit. / AI 修改：进程退出前通过 Nest 生命周期钩子完成排空。
  app.enableShutdownHooks();
  await app.listen();
  logger.log(
    `Demo greeting service is connected with queue group ${serviceEnvironment.DEMO_GREETING_NATS_QUEUE_GROUP}`,
  );
}

bootstrap().catch((failure: unknown) => {
  // AI modified: log only the failure type because broker errors can contain credential-bearing URLs. / AI 修改：仅记录失败类型，因为 broker 错误可能包含带凭据的 URL。
  logger.error(
    `Demo greeting service bootstrap failed type=${failure instanceof Error ? failure.name : 'UnknownFailure'}`,
  );
  // AI modified: fail closed so deployment tooling cannot treat a failed broker connection as healthy. / AI 修改：失败时关闭，避免部署工具将 broker 连接失败误判为健康状态。
  process.exitCode = 1;
});
