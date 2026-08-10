import {
  DEMO_GREETING_CONTRACT_VERSION,
  DEMO_GREETING_SERVICE_NAME,
} from '../../../contracts/demo-greeting.contract';
import { DemoGreetingServiceController } from './demo-greeting.controller';
import { DemoGreetingService } from './demo-greeting.service';

describe('DemoGreetingServiceController', () => {
  const controller = new DemoGreetingServiceController(
    new DemoGreetingService(),
  );

  it('handles the versioned greeting message', () => {
    expect(
      controller.getGreeting({
        contractVersion: DEMO_GREETING_CONTRACT_VERSION,
        name: 'Nest',
      }),
    ).toEqual({
      contractVersion: DEMO_GREETING_CONTRACT_VERSION,
      greeting: 'Hello, Nest!',
      servedBy: DEMO_GREETING_SERVICE_NAME,
    });
  });

  it('handles the versioned health message', () => {
    expect(
      controller.checkHealth({
        contractVersion: DEMO_GREETING_CONTRACT_VERSION,
      }),
    ).toEqual({
      contractVersion: DEMO_GREETING_CONTRACT_VERSION,
      service: DEMO_GREETING_SERVICE_NAME,
      status: 'up',
    });
  });
});
