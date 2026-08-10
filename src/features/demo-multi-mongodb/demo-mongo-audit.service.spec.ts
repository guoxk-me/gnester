import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { DemoMongoAuditService } from './demo-mongo-audit.service';
import { SECONDARY_MONGO_CONNECTION } from './demo-multi-mongodb.constants';
import { DemoMongoAudit } from './schemas/demo-mongo-audit.schema';

describe('DemoMongoAuditService', () => {
  const auditModel = {
    create: jest.fn(),
    find: jest.fn(),
  };

  let service: DemoMongoAuditService;

  beforeEach(async () => {
    jest.clearAllMocks();
    auditModel.create.mockResolvedValue({
      id: 'audit-id',
      demoId: 'demo-id',
      action: 'created',
    });
    auditModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue([]),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DemoMongoAuditService,
        {
          provide: getModelToken(
            DemoMongoAudit.name,
            SECONDARY_MONGO_CONNECTION,
          ),
          useValue: auditModel,
        },
      ],
    }).compile();

    service = module.get(DemoMongoAuditService);
  });

  it('writes audit documents through the named secondary Mongo model', async () => {
    const result = await service.recordDemoAction('demo-id', 'created');

    expect(auditModel.create).toHaveBeenCalledWith({
      demoId: 'demo-id',
      action: 'created',
    });
    expect(result).toEqual({
      id: 'audit-id',
      demoId: 'demo-id',
      action: 'created',
    });
  });
});
