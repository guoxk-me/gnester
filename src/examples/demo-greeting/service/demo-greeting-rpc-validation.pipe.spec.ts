import { ArgumentMetadata } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import {
  DEMO_GREETING_CONTRACT_VERSION,
  DEMO_GREETING_RPC_ERROR_CODES,
} from '../../../contracts/demo-greeting.contract';
import { DemoGreetingMessageDto } from './demo-greeting-message.dto';
import { demoGreetingRpcValidationPipe } from './demo-greeting-rpc-validation.pipe';

describe('demoGreetingRpcValidationPipe', () => {
  const metadata: ArgumentMetadata = {
    metatype: DemoGreetingMessageDto,
    type: 'body',
  };

  it('creates a validated DTO from a message payload', async () => {
    await expect(
      demoGreetingRpcValidationPipe().transform(
        {
          contractVersion: DEMO_GREETING_CONTRACT_VERSION,
          name: 'Nest',
        },
        metadata,
      ),
    ).resolves.toBeInstanceOf(DemoGreetingMessageDto);
  });

  it.each([
    {
      contractVersion: DEMO_GREETING_CONTRACT_VERSION,
      name: 'a'.repeat(65),
    },
    {
      contractVersion: DEMO_GREETING_CONTRACT_VERSION,
      debugSecret: 'must-not-enter-the-service',
      name: 'Nest',
    },
    {
      contractVersion: 2,
      name: 'Nest',
    },
  ])('rejects an invalid RPC payload', async (payload) => {
    try {
      await demoGreetingRpcValidationPipe().transform(payload, metadata);
      throw new Error('Expected RPC validation to fail.');
    } catch (failure: unknown) {
      expect(failure).toBeInstanceOf(RpcException);
      expect((failure as RpcException).getError()).toEqual({
        code: DEMO_GREETING_RPC_ERROR_CODES.validationFailed,
        message: 'Demo greeting request validation failed.',
      });
    }
  });
});
