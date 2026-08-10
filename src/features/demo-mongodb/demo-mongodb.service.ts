import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { CreateDemoMongoDto } from './dto/create-demo-mongo.dto';
import { UpdateDemoMongoDto } from './dto/update-demo-mongo.dto';
import { DemoMongo, DemoMongoDocument } from './schemas/demo-mongo.schema';

@Injectable()
export class DemoMongodbService {
  constructor(
    @InjectModel(DemoMongo.name)
    private readonly demoModel: Model<DemoMongoDocument>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async create(createDemoMongoDto: CreateDemoMongoDto): Promise<DemoMongo> {
    return this.demoModel.create(createDemoMongoDto);
  }

  async findAll(): Promise<DemoMongo[]> {
    return this.demoModel.find().exec();
  }

  async findOne(id: string): Promise<DemoMongo> {
    const demo = await this.demoModel.findById(id).exec();
    if (!demo) {
      throw new NotFoundException(`Mongo demo #${id} not found`);
    }

    return demo;
  }

  async update(
    id: string,
    updateDemoMongoDto: UpdateDemoMongoDto,
  ): Promise<DemoMongo> {
    const demo = await this.demoModel
      .findByIdAndUpdate(id, updateDemoMongoDto, { new: true })
      .exec();
    if (!demo) {
      throw new NotFoundException(`Mongo demo #${id} not found`);
    }

    return demo;
  }

  async remove(id: string): Promise<void> {
    const demo = await this.demoModel.findByIdAndDelete(id).exec();
    if (!demo) {
      throw new NotFoundException(`Mongo demo #${id} not found`);
    }
  }

  async createMany(
    createDemoMongoDtos: CreateDemoMongoDto[],
  ): Promise<DemoMongo[]> {
    const session = await this.connection.startSession();
    let createdDemos: DemoMongo[] = [];

    try {
      await session.withTransaction(async () => {
        createdDemos = await this.demoModel.create(createDemoMongoDtos, {
          session,
        });
      });

      return createdDemos;
    } finally {
      await session.endSession();
    }
  }
}
