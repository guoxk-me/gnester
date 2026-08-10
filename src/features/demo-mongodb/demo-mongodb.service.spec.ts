import { NotFoundException } from '@nestjs/common';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { DemoMongodbService } from './demo-mongodb.service';
import { DemoMongo } from './schemas/demo-mongo.schema';

describe('DemoMongodbService', () => {
  const demoModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };
  const session = {
    withTransaction: jest.fn(),
    endSession: jest.fn(),
  };
  const connection = {
    startSession: jest.fn(),
  };

  let service: DemoMongodbService;

  beforeEach(async () => {
    jest.clearAllMocks();
    demoModel.create.mockResolvedValue({
      id: 'demo-id',
      name: 'demo',
      description: 'mongodb example',
    });
    demoModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue([]),
    });
    demoModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });
    demoModel.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        id: 'demo-id',
        name: 'updated',
      }),
    });
    demoModel.findByIdAndDelete.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        id: 'demo-id',
      }),
    });
    session.withTransaction.mockImplementation(
      (callback: () => Promise<void>) => callback(),
    );
    connection.startSession.mockResolvedValue(session);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DemoMongodbService,
        {
          provide: getModelToken(DemoMongo.name),
          useValue: demoModel,
        },
        {
          provide: getConnectionToken(),
          useValue: connection,
        },
      ],
    }).compile();

    service = module.get(DemoMongodbService);
  });

  it('creates a Mongo document through the injected model', async () => {
    const result = await service.create({
      name: 'demo',
      description: 'mongodb example',
    });

    expect(demoModel.create).toHaveBeenCalledWith({
      name: 'demo',
      description: 'mongodb example',
    });
    expect(result).toEqual({
      id: 'demo-id',
      name: 'demo',
      description: 'mongodb example',
    });
  });

  it('throws NotFoundException for a missing Mongo document', async () => {
    await expect(service.findOne('missing-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('uses the injected connection to run a session transaction', async () => {
    await service.createMany([
      { name: 'first', description: 'first mongodb demo' },
      { name: 'second', description: 'second mongodb demo' },
    ]);

    expect(connection.startSession).toHaveBeenCalled();
    expect(session.withTransaction).toHaveBeenCalled();
    expect(demoModel.create).toHaveBeenCalledWith(
      [
        { name: 'first', description: 'first mongodb demo' },
        { name: 'second', description: 'second mongodb demo' },
      ],
      { session },
    );
    expect(session.endSession).toHaveBeenCalled();
  });
});
