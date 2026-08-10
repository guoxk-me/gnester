import { Module } from '@nestjs/common';
import { DemoGreetingServiceController } from './demo-greeting.controller';
import { DemoGreetingRpcExceptionFilter } from './demo-greeting-rpc-exception.filter';
import { DemoGreetingRpcInterceptor } from './demo-greeting-rpc.interceptor';
import { DemoGreetingService } from './demo-greeting.service';

@Module({
  controllers: [DemoGreetingServiceController],
  providers: [
    DemoGreetingService,
    DemoGreetingRpcExceptionFilter,
    DemoGreetingRpcInterceptor,
  ],
})
export class DemoGreetingServiceModule {}
