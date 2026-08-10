import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DemoGreetingController } from './demo-greeting.controller';
import { DEMO_GREETING_PORT } from './demo-greeting.port';
import {
  DEMO_GREETING_NATS_CLIENT,
  NatsDemoGreetingAdapter,
} from './nats-demo-greeting.adapter';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: DEMO_GREETING_NATS_CLIENT,
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.NATS,
          // AI modified: fail gateway startup when its required NATS dependency cannot be reached. / AI 修改：当 gateway 依赖的 NATS 无法连接时，使启动直接失败。
          options: {
            maxReconnectAttempts: 3,
            name: 'gnester-api-gateway',
            reconnect: true,
            reconnectTimeWait: 500,
            servers: configService.getOrThrow<string[]>('NATS_SERVERS'),
            timeout: configService.getOrThrow<number>(
              'NATS_CONNECTION_TIMEOUT_MS',
            ),
            waitOnFirstConnect: true,
          },
        }),
      },
    ]),
  ],
  controllers: [DemoGreetingController],
  providers: [
    {
      provide: DEMO_GREETING_PORT,
      useClass: NatsDemoGreetingAdapter,
    },
  ],
})
export class DemoGreetingGatewayModule {}
