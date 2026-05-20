import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { DemoAuditService } from './demo-audit.service';
import { SECONDARY_DATA_SOURCE } from './demo-multi-database.constants';
import { DemoAudit } from './entities/demo-audit.entity';

describe('DemoAuditService', () => {
  const auditRepository = {
    save: jest.fn(),
    find: jest.fn(),
  };

  let service: DemoAuditService;

  beforeEach(async () => {
    jest.clearAllMocks();
    auditRepository.save.mockImplementation(
      (value: Pick<DemoAudit, 'demoId' | 'action'>) =>
        Promise.resolve({ id: 1, ...value }),
    );
    auditRepository.find.mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DemoAuditService,
        {
          provide: getRepositoryToken(DemoAudit, SECONDARY_DATA_SOURCE),
          useValue: auditRepository,
        },
      ],
    }).compile();

    service = module.get(DemoAuditService);
  });

  it('writes audit rows to the named secondary database repository', async () => {
    const result = await service.recordDemoAction(7, 'created');

    expect(auditRepository.save).toHaveBeenCalledWith({
      demoId: 7,
      action: 'created',
    });
    expect(result).toEqual({
      id: 1,
      demoId: 7,
      action: 'created',
    });
  });
});
