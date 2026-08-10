import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SECONDARY_MONGO_CONNECTION } from './demo-multi-mongodb.constants';
import {
  DemoMongoAudit,
  DemoMongoAuditDocument,
} from './schemas/demo-mongo-audit.schema';

@Injectable()
export class DemoMongoAuditService {
  constructor(
    @InjectModel(DemoMongoAudit.name, SECONDARY_MONGO_CONNECTION)
    private readonly auditModel: Model<DemoMongoAuditDocument>,
  ) {}

  async recordDemoAction(
    demoId: string,
    action: string,
  ): Promise<DemoMongoAudit> {
    return this.auditModel.create({ demoId, action });
  }

  async findAll(): Promise<DemoMongoAudit[]> {
    return this.auditModel.find().exec();
  }
}
