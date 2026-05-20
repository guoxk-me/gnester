import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DemoAudit } from './entities/demo-audit.entity';
import { SECONDARY_DATA_SOURCE } from './demo-multi-database.constants';

@Injectable()
export class DemoAuditService {
  constructor(
    @InjectRepository(DemoAudit, SECONDARY_DATA_SOURCE)
    private readonly auditRepository: Repository<DemoAudit>,
  ) {}

  async recordDemoAction(demoId: number, action: string): Promise<DemoAudit> {
    return this.auditRepository.save({ demoId, action });
  }

  async findAll(): Promise<DemoAudit[]> {
    return this.auditRepository.find();
  }
}
