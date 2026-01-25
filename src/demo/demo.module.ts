import { Module } from '@nestjs/common';
import { DemoService } from './demo.service';
import { DemoController } from './demo.controller';
import { DemoSubscriber } from './demo.subscriber';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Demo } from './entities/demo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Demo])],
  controllers: [DemoController],
  providers: [DemoService, DemoSubscriber],
})
export class DemoModule {}
