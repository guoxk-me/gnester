import { Equals, IsInt, IsString, Length } from 'class-validator';
import {
  DEMO_GREETING_CONTRACT_VERSION,
  DemoGreetingHealthRequest,
  DemoGreetingRequest,
} from '../../../contracts/demo-greeting.contract';

// AI modified: concrete DTO classes give the standalone RPC ValidationPipe runtime metadata. / AI 修改：具体 DTO class 为独立 RPC ValidationPipe 提供运行时元数据。
export class DemoGreetingMessageDto implements DemoGreetingRequest {
  @IsInt()
  @Equals(DEMO_GREETING_CONTRACT_VERSION)
  readonly contractVersion: typeof DEMO_GREETING_CONTRACT_VERSION;

  @IsString()
  @Length(1, 64)
  readonly name: string;
}

export class DemoGreetingHealthMessageDto implements DemoGreetingHealthRequest {
  @IsInt()
  @Equals(DEMO_GREETING_CONTRACT_VERSION)
  readonly contractVersion: typeof DEMO_GREETING_CONTRACT_VERSION;
}
