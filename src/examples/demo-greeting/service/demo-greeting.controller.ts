import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DEMO_GREETING_MESSAGE_PATTERNS } from '../../../contracts/demo-greeting.contract';
import type {
  DemoGreetingHealthResponse,
  DemoGreetingResponse,
} from '../../../contracts/demo-greeting.contract';
import {
  DemoGreetingHealthMessageDto,
  DemoGreetingMessageDto,
} from './demo-greeting-message.dto';
import { DemoGreetingService } from './demo-greeting.service';

@Controller()
export class DemoGreetingServiceController {
  constructor(private readonly demoGreetingService: DemoGreetingService) {}

  @MessagePattern(DEMO_GREETING_MESSAGE_PATTERNS.getGreeting)
  getGreeting(
    @Payload() request: DemoGreetingMessageDto,
  ): DemoGreetingResponse {
    return this.demoGreetingService.getGreeting(request.name);
  }

  @MessagePattern(DEMO_GREETING_MESSAGE_PATTERNS.health)
  checkHealth(
    @Payload() request: DemoGreetingHealthMessageDto,
  ): DemoGreetingHealthResponse {
    // AI modified: retain the concrete DTO parameter so the global RPC pipe validates health messages. / AI 修改：保留具体 DTO 参数，使全局 RPC pipe 能校验健康消息。
    void request;
    return this.demoGreetingService.checkHealth();
  }
}
