import {
  Controller,
  Get,
  Headers,
  Inject,
  Param,
  Res,
  ServiceUnavailableException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { isUUID } from 'class-validator';
import type {
  DemoGreetingHealthResponse,
  DemoGreetingResponse,
} from '../../../contracts/demo-greeting.contract';
import { DEMO_GREETING_REQUEST_ID_HEADER } from '../../../contracts/demo-greeting.contract';
import { DemoGreetingParamsDto } from './demo-greeting-params.dto';
import {
  DemoGreetingCallContext,
  DEMO_GREETING_PORT,
  DemoGreetingUnavailableError,
} from './demo-greeting.port';
import type { DemoGreetingPort } from './demo-greeting.port';

interface HttpHeaderResponse {
  setHeader(name: string, value: string): void;
}

@Controller('demo-greeting')
export class DemoGreetingController {
  constructor(
    @Inject(DEMO_GREETING_PORT)
    private readonly demoGreetingPort: DemoGreetingPort,
  ) {}

  @Get('health')
  checkHealth(
    @Headers(DEMO_GREETING_REQUEST_ID_HEADER)
    incomingRequestId: string | undefined,
    @Res({ passthrough: true }) response: HttpHeaderResponse,
  ): Promise<DemoGreetingHealthResponse> {
    const context = this.callContext(incomingRequestId, response);

    return this.callDemoGreetingService(() =>
      this.demoGreetingPort.checkHealth(context),
    );
  }

  @Get(':name')
  getGreeting(
    @Param() params: DemoGreetingParamsDto,
    @Headers(DEMO_GREETING_REQUEST_ID_HEADER)
    incomingRequestId: string | undefined,
    @Res({ passthrough: true }) response: HttpHeaderResponse,
  ): Promise<DemoGreetingResponse> {
    const context = this.callContext(incomingRequestId, response);

    return this.callDemoGreetingService(() =>
      this.demoGreetingPort.getGreeting(params.name, context),
    );
  }

  private callContext(
    incomingRequestId: string | undefined,
    response: HttpHeaderResponse,
  ): DemoGreetingCallContext {
    // AI modified: preserve only UUID request IDs and propagate one stable value across HTTP and NATS. / AI 修改：仅保留 UUID 请求 ID，并在 HTTP 与 NATS 间传播同一稳定值。
    const requestId =
      incomingRequestId && isUUID(incomingRequestId, '4')
        ? incomingRequestId
        : randomUUID();
    response.setHeader(DEMO_GREETING_REQUEST_ID_HEADER, requestId);

    return { requestId };
  }

  private async callDemoGreetingService<Response>(
    operation: () => Promise<Response>,
  ): Promise<Response> {
    try {
      return await operation();
    } catch (failure: unknown) {
      // AI modified: keep transport failures behind a stable public HTTP error. / AI 修改：将传输故障封装为稳定的公共 HTTP 错误。
      if (failure instanceof DemoGreetingUnavailableError) {
        throw new ServiceUnavailableException(
          'Demo greeting service is unavailable.',
        );
      }

      throw failure;
    }
  }
}
