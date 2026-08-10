import { Injectable } from '@nestjs/common';
import {
  DEMO_GREETING_CONTRACT_VERSION,
  DEMO_GREETING_SERVICE_NAME,
  DemoGreetingHealthResponse,
  DemoGreetingResponse,
} from '../../../contracts/demo-greeting.contract';

@Injectable()
export class DemoGreetingService {
  getGreeting(name: string): DemoGreetingResponse {
    return {
      contractVersion: DEMO_GREETING_CONTRACT_VERSION,
      greeting: `Hello, ${name}!`,
      servedBy: DEMO_GREETING_SERVICE_NAME,
    };
  }

  checkHealth(): DemoGreetingHealthResponse {
    return {
      contractVersion: DEMO_GREETING_CONTRACT_VERSION,
      service: DEMO_GREETING_SERVICE_NAME,
      status: 'up',
    };
  }
}
