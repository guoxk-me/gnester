import {
  DemoGreetingHealthResponse,
  DemoGreetingResponse,
} from '../../../contracts/demo-greeting.contract';

export const DEMO_GREETING_PORT = Symbol('DEMO_GREETING_PORT');

export interface DemoGreetingCallContext {
  readonly requestId: string;
}

export interface DemoGreetingPort {
  checkHealth(
    context: DemoGreetingCallContext,
  ): Promise<DemoGreetingHealthResponse>;
  getGreeting(
    name: string,
    context: DemoGreetingCallContext,
  ): Promise<DemoGreetingResponse>;
}

export class DemoGreetingUnavailableError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = DemoGreetingUnavailableError.name;
  }
}
