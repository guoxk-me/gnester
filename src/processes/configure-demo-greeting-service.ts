import { INestMicroservice } from '@nestjs/common';
import { DemoGreetingRpcExceptionFilter } from '../examples/demo-greeting/service/demo-greeting-rpc-exception.filter';
import { DemoGreetingRpcInterceptor } from '../examples/demo-greeting/service/demo-greeting-rpc.interceptor';
import { demoGreetingRpcValidationPipe } from '../examples/demo-greeting/service/demo-greeting-rpc-validation.pipe';

export function configureDemoGreetingService(app: INestMicroservice): void {
  // AI modified: keep the production entrypoint and real-broker tests on one RPC boundary policy. / AI 修改：让生产入口与真实 broker 测试共享同一套 RPC 边界策略。
  app.useGlobalPipes(demoGreetingRpcValidationPipe());
  app.useGlobalInterceptors(app.get(DemoGreetingRpcInterceptor));
  app.useGlobalFilters(app.get(DemoGreetingRpcExceptionFilter));
}
