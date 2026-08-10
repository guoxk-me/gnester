import 'reflect-metadata';
import { validateDemoGreetingServiceConfig } from './demo-greeting-service.validation';

describe('validateDemoGreetingServiceConfig', () => {
  it('applies local defaults without requiring gateway infrastructure', () => {
    const serviceConfig = validateDemoGreetingServiceConfig({
      NODE_ENV: 'test',
    });

    expect(serviceConfig).toMatchObject({
      DEMO_GREETING_NATS_GRACE_PERIOD_MS: 1000,
      DEMO_GREETING_NATS_QUEUE_GROUP: 'gnester.demo-greeting.v1',
      NATS_CONNECTION_TIMEOUT_MS: 2000,
      NATS_SERVERS: ['nats://127.0.0.1:4222'],
      NODE_ENV: 'test',
    });
  });

  it('accepts and trims a broker cluster list', () => {
    const serviceConfig = validateDemoGreetingServiceConfig({
      NATS_SERVERS: 'nats://nats-1:4222, nats://nats-2:4222',
      NODE_ENV: 'test',
    });

    expect(serviceConfig.NATS_SERVERS).toEqual([
      'nats://nats-1:4222',
      'nats://nats-2:4222',
    ]);
  });

  it('rejects an invalid NATS URL', () => {
    expect(() =>
      validateDemoGreetingServiceConfig({
        NATS_SERVERS: 'http://not-a-nats-broker:4222',
        NODE_ENV: 'test',
      }),
    ).toThrow();
  });

  it('rejects an empty queue group', () => {
    expect(() =>
      validateDemoGreetingServiceConfig({
        DEMO_GREETING_NATS_QUEUE_GROUP: '',
        NODE_ENV: 'test',
      }),
    ).toThrow();
  });

  it('rejects whitespace in a queue group', () => {
    expect(() =>
      validateDemoGreetingServiceConfig({
        DEMO_GREETING_NATS_QUEUE_GROUP: 'demo greeting workers',
        NODE_ENV: 'test',
      }),
    ).toThrow();
  });
});
