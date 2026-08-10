import { ServiceUnavailableException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  DEMO_GREETING_CONTRACT_VERSION,
  DEMO_GREETING_REQUEST_ID_HEADER,
  DEMO_GREETING_SERVICE_NAME,
  DemoGreetingHealthResponse,
  DemoGreetingResponse,
} from '../../../contracts/demo-greeting.contract';
import { DemoGreetingController } from './demo-greeting.controller';
import {
  DEMO_GREETING_PORT,
  DemoGreetingCallContext,
  DemoGreetingPort,
  DemoGreetingUnavailableError,
} from './demo-greeting.port';

class InMemoryDemoGreetingAdapter implements DemoGreetingPort {
  lastRequestId: string | undefined;

  checkHealth(
    context: DemoGreetingCallContext,
  ): Promise<DemoGreetingHealthResponse> {
    this.lastRequestId = context.requestId;
    return Promise.resolve({
      contractVersion: DEMO_GREETING_CONTRACT_VERSION,
      service: DEMO_GREETING_SERVICE_NAME,
      status: 'up',
    });
  }

  getGreeting(
    name: string,
    context: DemoGreetingCallContext,
  ): Promise<DemoGreetingResponse> {
    this.lastRequestId = context.requestId;
    return Promise.resolve({
      contractVersion: DEMO_GREETING_CONTRACT_VERSION,
      greeting: `Test hello, ${name}!`,
      servedBy: DEMO_GREETING_SERVICE_NAME,
    });
  }
}

describe('DemoGreetingController', () => {
  it('propagates a valid request id through the caller-owned port', async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [DemoGreetingController],
      providers: [
        InMemoryDemoGreetingAdapter,
        {
          provide: DEMO_GREETING_PORT,
          useExisting: InMemoryDemoGreetingAdapter,
        },
      ],
    }).compile();
    const controller = testingModule.get(DemoGreetingController);
    const requestId = '123e4567-e89b-42d3-a456-426614174000';
    const response = { setHeader: jest.fn() };

    await expect(
      controller.getGreeting({ name: 'Codex' }, requestId, response),
    ).resolves.toEqual({
      contractVersion: DEMO_GREETING_CONTRACT_VERSION,
      greeting: 'Test hello, Codex!',
      servedBy: DEMO_GREETING_SERVICE_NAME,
    });
    expect(response.setHeader).toHaveBeenCalledWith(
      DEMO_GREETING_REQUEST_ID_HEADER,
      requestId,
    );
    expect(testingModule.get(InMemoryDemoGreetingAdapter).lastRequestId).toBe(
      requestId,
    );
  });

  it('replaces an invalid incoming request id', async () => {
    const adapter = new InMemoryDemoGreetingAdapter();
    const controller = new DemoGreetingController(adapter);
    const response = { setHeader: jest.fn() };

    await controller.checkHealth('not-a-uuid', response);

    expect(adapter.lastRequestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u,
    );
    expect(response.setHeader).toHaveBeenCalledWith(
      DEMO_GREETING_REQUEST_ID_HEADER,
      adapter.lastRequestId,
    );
  });

  it('maps remote failures to a stable public error', async () => {
    const unavailablePort: DemoGreetingPort = {
      checkHealth: () =>
        Promise.reject(new DemoGreetingUnavailableError('offline')),
      getGreeting: () =>
        Promise.reject(new DemoGreetingUnavailableError('offline')),
    };
    const controller = new DemoGreetingController(unavailablePort);

    await expect(
      controller.checkHealth(undefined, { setHeader: jest.fn() }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
