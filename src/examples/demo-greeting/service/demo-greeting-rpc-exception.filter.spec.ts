import { ArgumentsHost, Logger } from '@nestjs/common';
import { NatsContext, RpcException } from '@nestjs/microservices';
import { headers } from 'nats';
import { firstValueFrom } from 'rxjs';
import {
  DEMO_GREETING_REQUEST_ID_HEADER,
  DEMO_GREETING_RPC_ERROR_CODES,
} from '../../../contracts/demo-greeting.contract';
import { DemoGreetingRpcExceptionFilter } from './demo-greeting-rpc-exception.filter';

describe('DemoGreetingRpcExceptionFilter', () => {
  const requestId = '123e4567-e89b-42d3-a456-426614174000';

  function host(): ArgumentsHost {
    const messageHeaders = headers();
    messageHeaders.set(DEMO_GREETING_REQUEST_ID_HEADER, requestId);
    const context = new NatsContext([
      'gnester.demo-greeting.v1.get',
      messageHeaders,
    ]);

    return {
      switchToRpc: () => ({
        getContext: () => context,
        getData: () => undefined,
      }),
    } as unknown as ArgumentsHost;
  }

  it('returns a stable allowlisted RpcException error', async () => {
    const filter = new DemoGreetingRpcExceptionFilter();
    const failure = firstValueFrom(
      filter.catch(
        new RpcException({
          code: DEMO_GREETING_RPC_ERROR_CODES.validationFailed,
          debugSecret: 'must-not-cross-the-seam',
          message: 'untrusted internal detail',
        }),
        host(),
      ),
    );

    await expect(failure).rejects.toEqual({
      status: 'error',
      code: DEMO_GREETING_RPC_ERROR_CODES.validationFailed,
      message: 'Demo greeting request validation failed.',
      requestId,
    });
  });

  it('hides unexpected errors and stack traces', async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const filter = new DemoGreetingRpcExceptionFilter();
    const failure = firstValueFrom(
      filter.catch(new Error('database password leaked'), host()),
    );

    await expect(failure).rejects.toEqual({
      status: 'error',
      code: DEMO_GREETING_RPC_ERROR_CODES.internal,
      message: 'Internal demo greeting service error.',
      requestId,
    });
  });
});
