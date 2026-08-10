import { randomUUID } from 'node:crypto';
import { isUUID } from 'class-validator';
import { NatsContext } from '@nestjs/microservices';
import { DEMO_GREETING_REQUEST_ID_HEADER } from '../../../contracts/demo-greeting.contract';

interface NatsMessageHeaders {
  get(name: string): unknown;
  set(name: string, value: string): void;
}

function isNatsMessageHeaders(
  candidate: unknown,
): candidate is NatsMessageHeaders {
  if (typeof candidate !== 'object' || candidate === null) {
    return false;
  }

  const possibleHeaders = candidate as Record<string, unknown>;
  return (
    typeof possibleHeaders.get === 'function' &&
    typeof possibleHeaders.set === 'function'
  );
}

export function demoGreetingRequestId(context: NatsContext): string {
  const messageHeaders: unknown = context.getHeaders();

  // AI modified: accept only UUID v4 correlation values before they enter service logs and wire errors. / AI 修改：correlation 值进入服务日志与 wire error 前仅接受 UUID v4。
  if (isNatsMessageHeaders(messageHeaders)) {
    const incomingRequestId = messageHeaders.get(
      DEMO_GREETING_REQUEST_ID_HEADER,
    );

    if (typeof incomingRequestId === 'string' && isUUID(incomingRequestId, 4)) {
      return incomingRequestId;
    }

    const requestId = randomUUID();
    messageHeaders.set(DEMO_GREETING_REQUEST_ID_HEADER, requestId);
    return requestId;
  }

  return randomUUID();
}
