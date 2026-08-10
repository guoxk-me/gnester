import { CallHandler, ExecutionContext, Logger } from '@nestjs/common';
import { NatsContext } from '@nestjs/microservices';
import { headers } from 'nats';
import { firstValueFrom, of } from 'rxjs';
import {
  DEMO_GREETING_REQUEST_ID_HEADER,
  DEMO_GREETING_MESSAGE_PATTERNS,
} from '../../../contracts/demo-greeting.contract';
import { DemoGreetingRpcInterceptor } from './demo-greeting-rpc.interceptor';

describe('DemoGreetingRpcInterceptor', () => {
  it('logs the NATS subject and propagated request id without the payload', async () => {
    const requestId = '123e4567-e89b-42d3-a456-426614174000';
    const messageHeaders = headers();
    messageHeaders.set(DEMO_GREETING_REQUEST_ID_HEADER, requestId);
    const natsContext = new NatsContext([
      DEMO_GREETING_MESSAGE_PATTERNS.getGreeting,
      messageHeaders,
    ]);
    const context = {
      switchToRpc: () => ({ getContext: () => natsContext }),
    } as unknown as ExecutionContext;
    const next: CallHandler<unknown> = { handle: () => of('response') };
    const log = jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => undefined);

    await expect(
      firstValueFrom(new DemoGreetingRpcInterceptor().intercept(context, next)),
    ).resolves.toBe('response');
    expect(log).toHaveBeenCalledWith(
      expect.stringContaining(DEMO_GREETING_MESSAGE_PATTERNS.getGreeting),
    );
    expect(log).toHaveBeenCalledWith(expect.stringContaining(requestId));
    expect(log).not.toHaveBeenCalledWith(expect.stringContaining('response'));
  });
});
