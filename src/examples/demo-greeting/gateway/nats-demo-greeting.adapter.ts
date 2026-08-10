import {
  Inject,
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  NatsRecord,
  NatsRecordBuilder,
} from '@nestjs/microservices';
import { headers, type MsgHdrs } from 'nats';
import { firstValueFrom, timeout } from 'rxjs';
import {
  DEMO_GREETING_CONTRACT_VERSION,
  DEMO_GREETING_MESSAGE_PATTERNS,
  DEMO_GREETING_REQUEST_ID_HEADER,
  DEMO_GREETING_SERVICE_NAME,
  DemoGreetingHealthRequest,
  DemoGreetingHealthResponse,
  DemoGreetingRequest,
  DemoGreetingResponse,
} from '../../../contracts/demo-greeting.contract';
import {
  DemoGreetingCallContext,
  DemoGreetingPort,
  DemoGreetingUnavailableError,
} from './demo-greeting.port';

export const DEMO_GREETING_NATS_CLIENT = Symbol('DEMO_GREETING_NATS_CLIENT');

function isGreetingResponse(
  responseBody: unknown,
): responseBody is DemoGreetingResponse {
  if (typeof responseBody !== 'object' || responseBody === null) {
    return false;
  }

  const candidate = responseBody as Record<string, unknown>;
  return (
    candidate.contractVersion === DEMO_GREETING_CONTRACT_VERSION &&
    typeof candidate.greeting === 'string' &&
    candidate.servedBy === DEMO_GREETING_SERVICE_NAME
  );
}

function isHealthResponse(
  responseBody: unknown,
): responseBody is DemoGreetingHealthResponse {
  if (typeof responseBody !== 'object' || responseBody === null) {
    return false;
  }

  const candidate = responseBody as Record<string, unknown>;
  return (
    candidate.contractVersion === DEMO_GREETING_CONTRACT_VERSION &&
    candidate.service === DEMO_GREETING_SERVICE_NAME &&
    candidate.status === 'up'
  );
}

@Injectable()
export class NatsDemoGreetingAdapter
  implements DemoGreetingPort, OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly timeoutMs: number;

  constructor(
    private readonly configService: ConfigService,
    @Inject(DEMO_GREETING_NATS_CLIENT)
    private readonly client: ClientProxy,
  ) {
    this.timeoutMs = this.configService.getOrThrow<number>(
      'DEMO_GREETING_REQUEST_TIMEOUT_MS',
    );
  }

  async onApplicationBootstrap(): Promise<void> {
    // AI modified: establish the broker connection during bootstrap so readiness fails closed. / AI 修改：在启动阶段建立 broker 连接，使 readiness 在连接失败时关闭。
    await this.client.connect();
  }

  async onApplicationShutdown(): Promise<void> {
    // AI modified: await the NATS drain so Nest does not leave the status iterator open after shutdown. / AI 修改：等待 NATS 排空，避免 Nest 关闭后遗留 status iterator。
    await this.client.close();
  }

  async getGreeting(
    name: string,
    context: DemoGreetingCallContext,
  ): Promise<DemoGreetingResponse> {
    const responseBody = await this.request<
      DemoGreetingResponse,
      DemoGreetingRequest
    >(
      DEMO_GREETING_MESSAGE_PATTERNS.getGreeting,
      {
        contractVersion: DEMO_GREETING_CONTRACT_VERSION,
        name,
      },
      context,
    );

    // AI modified: validate and allowlist the remote contract before it enters gateway behavior. / AI 修改：远程契约进入 gateway 行为前先校验并按白名单重建。
    if (!isGreetingResponse(responseBody)) {
      throw new DemoGreetingUnavailableError(
        'Demo greeting service returned an incompatible response.',
      );
    }

    return {
      contractVersion: responseBody.contractVersion,
      greeting: responseBody.greeting,
      servedBy: responseBody.servedBy,
    };
  }

  async checkHealth(
    context: DemoGreetingCallContext,
  ): Promise<DemoGreetingHealthResponse> {
    const responseBody = await this.request<
      DemoGreetingHealthResponse,
      DemoGreetingHealthRequest
    >(
      DEMO_GREETING_MESSAGE_PATTERNS.health,
      { contractVersion: DEMO_GREETING_CONTRACT_VERSION },
      context,
    );

    if (!isHealthResponse(responseBody)) {
      throw new DemoGreetingUnavailableError(
        'Demo greeting service returned an incompatible health response.',
      );
    }

    return {
      contractVersion: responseBody.contractVersion,
      service: responseBody.service,
      status: responseBody.status,
    };
  }

  private async request<Response, Request>(
    pattern: string,
    request: Request,
    context: DemoGreetingCallContext,
  ): Promise<Response> {
    const messageHeaders = headers();
    messageHeaders.set(DEMO_GREETING_REQUEST_ID_HEADER, context.requestId);
    const messageRecord = new NatsRecordBuilder<Request>(request)
      .setHeaders<MsgHdrs>(messageHeaders)
      .build() as unknown as NatsRecord<Request, MsgHdrs>;

    try {
      // AI modified: ClientProxy.send is cold, so firstValueFrom subscribes and enforces a bounded response time. / AI 修改：ClientProxy.send 是冷 Observable，使用 firstValueFrom 订阅并限制响应时间。
      return await firstValueFrom(
        this.client
          .send<Response, NatsRecord<Request, MsgHdrs>>(pattern, messageRecord)
          .pipe(timeout(this.timeoutMs)),
      );
    } catch (failure: unknown) {
      throw new DemoGreetingUnavailableError(
        'Demo greeting service is unavailable.',
        { cause: failure },
      );
    }
  }
}
