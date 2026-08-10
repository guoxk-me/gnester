import { ConfigService } from '@nestjs/config';
import { ClientProxy, NatsRecord } from '@nestjs/microservices';
import type { MsgHdrs } from 'nats';
import { NEVER, of, throwError } from 'rxjs';
import {
  DEMO_GREETING_CONTRACT_VERSION,
  DEMO_GREETING_MESSAGE_PATTERNS,
  DEMO_GREETING_REQUEST_ID_HEADER,
  DEMO_GREETING_SERVICE_NAME,
  DemoGreetingRequest,
} from '../../../contracts/demo-greeting.contract';
import { DemoGreetingUnavailableError } from './demo-greeting.port';
import { NatsDemoGreetingAdapter } from './nats-demo-greeting.adapter';

describe('NatsDemoGreetingAdapter', () => {
  const requestId = '123e4567-e89b-42d3-a456-426614174000';

  function fixture(timeoutMs = 1000): {
    readonly adapter: NatsDemoGreetingAdapter;
    readonly close: jest.Mock;
    readonly connect: jest.Mock;
    readonly send: jest.Mock;
  } {
    const close = jest.fn();
    const connect = jest.fn(() => Promise.resolve());
    const send = jest.fn();
    const client = { close, connect, send } as unknown as ClientProxy;
    const configService = {
      getOrThrow: jest.fn().mockReturnValue(timeoutMs),
    } as unknown as ConfigService;

    return {
      adapter: new NatsDemoGreetingAdapter(configService, client),
      close,
      connect,
      send,
    };
  }

  it('sends the versioned request and correlation header through NATS', async () => {
    const { adapter, send } = fixture();
    send.mockReturnValue(
      of({
        contractVersion: DEMO_GREETING_CONTRACT_VERSION,
        greeting: 'Hello, Codex!',
        servedBy: DEMO_GREETING_SERVICE_NAME,
      }),
    );

    await expect(adapter.getGreeting('Codex', { requestId })).resolves.toEqual({
      contractVersion: DEMO_GREETING_CONTRACT_VERSION,
      greeting: 'Hello, Codex!',
      servedBy: DEMO_GREETING_SERVICE_NAME,
    });

    const [pattern, messageRecord] = send.mock.calls[0] as [
      string,
      NatsRecord<DemoGreetingRequest, MsgHdrs>,
    ];
    expect(pattern).toBe(DEMO_GREETING_MESSAGE_PATTERNS.getGreeting);
    expect(messageRecord.data).toEqual({
      contractVersion: DEMO_GREETING_CONTRACT_VERSION,
      name: 'Codex',
    });
    expect(messageRecord.headers?.get(DEMO_GREETING_REQUEST_ID_HEADER)).toBe(
      requestId,
    );
  });

  it('strips additional downstream fields from the public response', async () => {
    const { adapter, send } = fixture();
    send.mockReturnValue(
      of({
        contractVersion: DEMO_GREETING_CONTRACT_VERSION,
        debugSecret: 'must-not-cross-the-seam',
        greeting: 'Hello, Codex!',
        servedBy: DEMO_GREETING_SERVICE_NAME,
      }),
    );

    const greeting = await adapter.getGreeting('Codex', { requestId });

    expect(greeting).toEqual({
      contractVersion: DEMO_GREETING_CONTRACT_VERSION,
      greeting: 'Hello, Codex!',
      servedBy: DEMO_GREETING_SERVICE_NAME,
    });
    expect(greeting).not.toHaveProperty('debugSecret');
  });

  it('rejects an incompatible response contract', async () => {
    const { adapter, send } = fixture();
    send.mockReturnValue(
      of({
        contractVersion: 2,
        greeting: 'Hello, Codex!',
        servedBy: DEMO_GREETING_SERVICE_NAME,
      }),
    );

    await expect(
      adapter.getGreeting('Codex', { requestId }),
    ).rejects.toBeInstanceOf(DemoGreetingUnavailableError);
  });

  it('bounds a request that never returns', async () => {
    const { adapter, send } = fixture(10);
    send.mockReturnValue(NEVER);

    await expect(adapter.checkHealth({ requestId })).rejects.toMatchObject({
      message: 'Demo greeting service is unavailable.',
      name: DemoGreetingUnavailableError.name,
    });
  });

  it('hides broker failures behind the caller-owned port error', async () => {
    const { adapter, send } = fixture();
    send.mockReturnValue(throwError(() => new Error('broker unavailable')));

    await expect(adapter.checkHealth({ requestId })).rejects.toMatchObject({
      message: 'Demo greeting service is unavailable.',
      name: DemoGreetingUnavailableError.name,
    });
  });

  it('connects and closes the ClientProxy with the Nest lifecycle', async () => {
    const { adapter, close, connect } = fixture();

    await adapter.onApplicationBootstrap();
    await adapter.onApplicationShutdown();

    expect(connect).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
  });
});
