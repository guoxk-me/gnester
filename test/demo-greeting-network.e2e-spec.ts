import { INestApplication, INestMicroservice } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { ClientProxy, NatsRecordBuilder } from '@nestjs/microservices';
import { Test } from '@nestjs/testing';
import { headers } from 'nats';
import { firstValueFrom, timeout } from 'rxjs';
import request from 'supertest';
import { App } from 'supertest/types';
import { validateDemoGreetingServiceConfig } from '../config/demo-greeting-service.validation';
import { configureHttpApplication } from '../src/bootstrap/http/configure-http-application';
import {
  DEMO_GREETING_CONTRACT_VERSION,
  DEMO_GREETING_MESSAGE_PATTERNS,
  DEMO_GREETING_REQUEST_ID_HEADER,
  DEMO_GREETING_RPC_ERROR_CODES,
  DEMO_GREETING_SERVICE_NAME,
} from '../src/contracts/demo-greeting.contract';
import { DemoGreetingGatewayModule } from '../src/examples/demo-greeting/gateway/demo-greeting-gateway.module';
import { DEMO_GREETING_NATS_CLIENT } from '../src/examples/demo-greeting/gateway/nats-demo-greeting.adapter';
import { configureDemoGreetingService } from '../src/processes/configure-demo-greeting-service';
import { DemoGreetingServiceAppModule } from '../src/processes/demo-greeting-service.module';
import { demoGreetingServiceOptions } from '../src/processes/demo-greeting-service.options';

describe('Demo greeting NATS seam (e2e)', () => {
  let gatewayApp: INestApplication<App>;
  let serviceApp: INestMicroservice;
  let isServiceClosed = false;

  beforeAll(async () => {
    const serviceEnvironment = validateDemoGreetingServiceConfig({
      ...process.env,
      DEMO_GREETING_NATS_GRACE_PERIOD_MS: 0,
    });
    serviceApp = await NestFactory.createMicroservice(
      DemoGreetingServiceAppModule,
      {
        ...demoGreetingServiceOptions(serviceEnvironment),
        logger: false,
      },
    );
    configureDemoGreetingService(serviceApp);
    await serviceApp.listen();

    const gatewayFixture = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          ignoreEnvFile: true,
          isGlobal: true,
          load: [
            () => ({
              DEMO_GREETING_REQUEST_TIMEOUT_MS: 500,
              NATS_CONNECTION_TIMEOUT_MS: 1000,
              NATS_SERVERS: serviceEnvironment.NATS_SERVERS,
              PORT: 3000,
            }),
          ],
        }),
        DemoGreetingGatewayModule,
      ],
    }).compile();
    gatewayApp = gatewayFixture.createNestApplication();
    configureHttpApplication(gatewayApp, { portConfigKey: 'PORT' });
    await gatewayApp.init();
  });

  afterAll(async () => {
    await gatewayApp.close();

    if (!isServiceClosed) {
      await serviceApp.close();
    }
  });

  it('crosses HTTP, ClientProxy, NATS, and MessagePattern', async () => {
    const requestId = '123e4567-e89b-42d3-a456-426614174000';

    await request(gatewayApp.getHttpServer())
      .get('/v1/demo-greeting/Codex')
      .set(DEMO_GREETING_REQUEST_ID_HEADER, requestId)
      .expect(DEMO_GREETING_REQUEST_ID_HEADER, requestId)
      .expect(200)
      .expect({
        contractVersion: DEMO_GREETING_CONTRACT_VERSION,
        greeting: 'Hello, Codex!',
        servedBy: DEMO_GREETING_SERVICE_NAME,
      });
  });

  it('reports service-group readiness through NATS', async () => {
    await request(gatewayApp.getHttpServer())
      .get('/v1/demo-greeting/health')
      .expect(200)
      .expect({
        contractVersion: DEMO_GREETING_CONTRACT_VERSION,
        service: DEMO_GREETING_SERVICE_NAME,
        status: 'up',
      });
  });

  it('rejects an invalid HTTP path parameter before publishing', async () => {
    await request(gatewayApp.getHttpServer())
      .get(`/v1/demo-greeting/${'a'.repeat(65)}`)
      .expect(400);
  });

  it('returns the stable RPC error contract for an invalid NATS payload', async () => {
    const requestId = '123e4567-e89b-42d3-a456-426614174001';
    const messageHeaders = headers();
    messageHeaders.set(DEMO_GREETING_REQUEST_ID_HEADER, requestId);
    const client = gatewayApp.get<ClientProxy>(DEMO_GREETING_NATS_CLIENT);
    const call = firstValueFrom(
      client
        .send(
          DEMO_GREETING_MESSAGE_PATTERNS.getGreeting,
          new NatsRecordBuilder({
            contractVersion: DEMO_GREETING_CONTRACT_VERSION,
            debugSecret: 'must-not-enter-the-service',
            name: 'Codex',
          })
            .setHeaders(messageHeaders)
            .build(),
        )
        .pipe(timeout(1000)),
    );

    await expect(call).rejects.toEqual({
      status: 'error',
      code: DEMO_GREETING_RPC_ERROR_CODES.validationFailed,
      message: 'Demo greeting request validation failed.',
      requestId,
    });
  });

  it('maps a stopped service to the stable public 503', async () => {
    await serviceApp.close();
    isServiceClosed = true;

    await request(gatewayApp.getHttpServer())
      .get('/v1/demo-greeting/health')
      .expect(503)
      .expect(({ body }: { body: Record<string, unknown> }) => {
        expect(body).not.toHaveProperty('stack');
        expect(JSON.stringify(body)).not.toContain('nats://');
      });
  });
});
