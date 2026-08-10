import { ValidationPipe } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { DEMO_GREETING_RPC_ERROR_CODES } from '../../../contracts/demo-greeting.contract';

export function demoGreetingRpcValidationPipe(): ValidationPipe {
  // AI modified: RPC validation emits a stable RpcException instead of an HTTP exception. / AI 修改：RPC 校验返回稳定的 RpcException，而不是 HTTP 异常。
  return new ValidationPipe({
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
    transform: true,
    validationError: {
      target: false,
      value: false,
    },
    whitelist: true,
    exceptionFactory: () =>
      new RpcException({
        code: DEMO_GREETING_RPC_ERROR_CODES.validationFailed,
        message: 'Demo greeting request validation failed.',
      }),
  });
}
