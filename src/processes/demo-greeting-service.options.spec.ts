import { Transport } from '@nestjs/microservices';
import { Environment } from 'config/config.types';
import { demoGreetingServiceOptions } from './demo-greeting-service.options';

describe('demoGreetingServiceOptions', () => {
  it('configures NATS queue scaling and bounded graceful shutdown', () => {
    const serviceOptions = demoGreetingServiceOptions({
      DEMO_GREETING_NATS_GRACE_PERIOD_MS: 250,
      DEMO_GREETING_NATS_QUEUE_GROUP: 'demo-workers',
      NATS_CONNECTION_TIMEOUT_MS: 1500,
      NATS_SERVERS: ['nats://nats-1:4222', 'nats://nats-2:4222'],
      NODE_ENV: Environment.Test,
    });

    expect(serviceOptions.transport).toBe(Transport.NATS);
    expect(serviceOptions.options).toMatchObject({
      gracePeriod: 250,
      gracefulShutdown: true,
      queue: 'demo-workers',
      servers: ['nats://nats-1:4222', 'nats://nats-2:4222'],
      timeout: 1500,
      waitOnFirstConnect: true,
    });
  });
});
