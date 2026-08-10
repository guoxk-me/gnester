export const DEMO_GREETING_CONTRACT_VERSION = 1 as const;
export const DEMO_GREETING_SERVICE_NAME = 'demo-greeting-service' as const;
export const DEMO_GREETING_REQUEST_ID_HEADER = 'x-request-id' as const;

// AI modified: version both the subject and payload so incompatible callers fail at a visible boundary. / AI 修改：同时对 subject 与 payload 进行版本化，使不兼容调用方在明确边界失败。
export const DEMO_GREETING_MESSAGE_PATTERNS = {
  getGreeting: 'gnester.demo-greeting.v1.get',
  health: 'gnester.demo-greeting.v1.health',
} as const;

export const DEMO_GREETING_RPC_ERROR_CODES = {
  internal: 'INTERNAL_ERROR',
  validationFailed: 'VALIDATION_FAILED',
} as const;

export type DemoGreetingRpcErrorCode =
  (typeof DEMO_GREETING_RPC_ERROR_CODES)[keyof typeof DEMO_GREETING_RPC_ERROR_CODES];

export interface DemoGreetingRequest {
  readonly contractVersion: typeof DEMO_GREETING_CONTRACT_VERSION;
  readonly name: string;
}

export interface DemoGreetingHealthRequest {
  readonly contractVersion: typeof DEMO_GREETING_CONTRACT_VERSION;
}

export interface DemoGreetingResponse {
  readonly contractVersion: typeof DEMO_GREETING_CONTRACT_VERSION;
  readonly greeting: string;
  readonly servedBy: typeof DEMO_GREETING_SERVICE_NAME;
}

export interface DemoGreetingHealthResponse {
  readonly contractVersion: typeof DEMO_GREETING_CONTRACT_VERSION;
  readonly service: typeof DEMO_GREETING_SERVICE_NAME;
  readonly status: 'up';
}

export interface DemoGreetingRpcError {
  readonly status: 'error';
  readonly code: DemoGreetingRpcErrorCode;
  readonly message: string;
  readonly requestId: string;
}
