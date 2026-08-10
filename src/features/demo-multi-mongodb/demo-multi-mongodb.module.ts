import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DemoMongoAuditService } from './demo-mongo-audit.service';
import { SECONDARY_MONGO_CONNECTION } from './demo-multi-mongodb.constants';
import {
  DemoMongoAudit,
  DemoMongoAuditSchema,
} from './schemas/demo-mongo-audit.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: DemoMongoAudit.name, schema: DemoMongoAuditSchema }],
      SECONDARY_MONGO_CONNECTION,
    ),
  ],
  providers: [DemoMongoAuditService],
  exports: [DemoMongoAuditService],
})
export class DemoMultiMongodbModule {}
