import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateDemoGreetingServiceConfig } from 'config/demo-greeting-service.validation';
import { environmentFilePaths } from 'config/environment-files';
import { DemoGreetingServiceModule } from '../examples/demo-greeting/service/demo-greeting-service.module';

// AI modified: this composition root owns only the dependencies required by the remote demo process. / AI 修改：此装配根仅拥有远程 Demo 进程所需的依赖。
@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: false,
      envFilePath: environmentFilePaths(),
      isGlobal: true,
      cache: true,
      validate: validateDemoGreetingServiceConfig,
    }),
    DemoGreetingServiceModule,
  ],
})
export class DemoGreetingServiceAppModule {}
