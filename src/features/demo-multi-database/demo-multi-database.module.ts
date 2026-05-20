import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemoAuditService } from './demo-audit.service';
import { DemoAudit } from './entities/demo-audit.entity';
import { SECONDARY_DATA_SOURCE } from './demo-multi-database.constants';

@Module({
  imports: [TypeOrmModule.forFeature([DemoAudit], SECONDARY_DATA_SOURCE)],
  providers: [DemoAuditService],
  exports: [DemoAuditService],
})
export class DemoMultiDatabaseModule {}
