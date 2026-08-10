import { NatsOptions, Transport } from '@nestjs/microservices';
import type { DemoGreetingServiceEnvironment } from 'config/demo-greeting-service.validation';

export function demoGreetingServiceOptions(
  environment: DemoGreetingServiceEnvironment,
): NatsOptions {
  // AI modified: queue groups make replicas compete for each request instead of duplicating synchronous work. / AI 修改：queue group 让副本竞争处理请求，避免同步工作被重复执行。
  return {
    transport: Transport.NATS,
    options: {
      gracePeriod: environment.DEMO_GREETING_NATS_GRACE_PERIOD_MS,
      gracefulShutdown: true,
      maxReconnectAttempts: 3,
      name: 'gnester-demo-greeting-service',
      queue: environment.DEMO_GREETING_NATS_QUEUE_GROUP,
      reconnect: true,
      reconnectTimeWait: 500,
      servers: environment.NATS_SERVERS,
      timeout: environment.NATS_CONNECTION_TIMEOUT_MS,
      waitOnFirstConnect: true,
    },
  };
}
