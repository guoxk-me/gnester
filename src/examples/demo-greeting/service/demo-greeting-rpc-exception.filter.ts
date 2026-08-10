import {
  ArgumentsHost,
  Catch,
  Injectable,
  Logger,
  RpcExceptionFilter,
} from '@nestjs/common';
import { NatsContext, RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import {
  DEMO_GREETING_RPC_ERROR_CODES,
  DemoGreetingRpcError,
  DemoGreetingRpcErrorCode,
} from '../../../contracts/demo-greeting.contract';
import { demoGreetingRequestId } from './demo-greeting-request-id';

interface RpcErrorDescriptor {
  readonly code: DemoGreetingRpcErrorCode;
}

function isRpcErrorDescriptor(
  candidate: unknown,
): candidate is RpcErrorDescriptor {
  if (typeof candidate !== 'object' || candidate === null) {
    return false;
  }

  const possibleError = candidate as Record<string, unknown>;
  const isKnownCode =
    possibleError.code === DEMO_GREETING_RPC_ERROR_CODES.validationFailed ||
    possibleError.code === DEMO_GREETING_RPC_ERROR_CODES.internal;

  return isKnownCode;
}

@Catch()
@Injectable()
export class DemoGreetingRpcExceptionFilter implements RpcExceptionFilter<unknown> {
  private readonly logger = new Logger(DemoGreetingRpcExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): Observable<never> {
    const natsContext = host.switchToRpc().getContext<NatsContext>();
    const requestId = demoGreetingRequestId(natsContext);
    const rpcError = this.rpcError(exception, requestId, natsContext);

    // AI modified: return a plain allowlisted error and never serialize Error objects or stack traces over NATS. / AI 修改：只返回白名单普通错误，绝不通过 NATS 序列化 Error 对象或堆栈。
    return throwError(() => rpcError);
  }

  private rpcError(
    exception: unknown,
    requestId: string,
    context: NatsContext,
  ): DemoGreetingRpcError {
    if (exception instanceof RpcException) {
      const exceptionError = exception.getError();

      if (isRpcErrorDescriptor(exceptionError)) {
        const message =
          exceptionError.code === DEMO_GREETING_RPC_ERROR_CODES.validationFailed
            ? 'Demo greeting request validation failed.'
            : 'Internal demo greeting service error.';

        return {
          status: 'error',
          code: exceptionError.code,
          message,
          requestId,
        };
      }
    }

    this.logger.error(
      `Unhandled RPC failure subject=${context.getSubject()} requestId=${requestId}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    return {
      status: 'error',
      code: DEMO_GREETING_RPC_ERROR_CODES.internal,
      message: 'Internal demo greeting service error.',
      requestId,
    };
  }
}
