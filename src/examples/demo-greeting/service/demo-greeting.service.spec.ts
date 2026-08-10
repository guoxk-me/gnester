import {
  DEMO_GREETING_CONTRACT_VERSION,
  DEMO_GREETING_SERVICE_NAME,
} from '../../../contracts/demo-greeting.contract';
import { DemoGreetingService } from './demo-greeting.service';

describe('DemoGreetingService', () => {
  it('returns the versioned service contract', () => {
    const service = new DemoGreetingService();

    expect(service.getGreeting('Nest')).toEqual({
      contractVersion: DEMO_GREETING_CONTRACT_VERSION,
      greeting: 'Hello, Nest!',
      servedBy: DEMO_GREETING_SERVICE_NAME,
    });
  });

  it('reports broker-level readiness through the versioned contract', () => {
    const service = new DemoGreetingService();

    expect(service.checkHealth()).toEqual({
      contractVersion: DEMO_GREETING_CONTRACT_VERSION,
      service: DEMO_GREETING_SERVICE_NAME,
      status: 'up',
    });
  });
});
