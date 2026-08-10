import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { NatsContext } from '@nestjs/microservices';
import { Observable, finalize, tap } from 'rxjs';
import { demoGreetingRequestId } from './demo-greeting-request-id';

@Injectable()
export class DemoGreetingRpcInterceptor implements NestInterceptor<
  unknown,
  unknown
> {
  private readonly logger = new Logger(DemoGreetingRpcInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Observable<unknown> {
    const natsContext = context.switchToRpc().getContext<NatsContext>();
    const requestId = demoGreetingRequestId(natsContext);
    const subject = natsContext.getSubject();
    const startedAt = performance.now();
    let outcome = 'succeeded';

    // AI modified: log transport metadata only, never the RPC payload or broker credentials. / AI 修改：仅记录 transport 元数据，绝不记录 RPC payload 或 broker 凭据。
    return next.handle().pipe(
      tap({
        error: () => {
          outcome = 'failed';
        },
      }),
      finalize(() => {
        const durationMs = Math.round(performance.now() - startedAt);
        this.logger.log(
          `RPC ${subject} ${outcome} requestId=${requestId} durationMs=${durationMs}`,
        );
      }),
    );
  }
}
