import { Injectable } from '@nestjs/common';
import { CreateDemoDto } from './dto/create-demo.dto';
import { UpdateDemoDto } from './dto/update-demo.dto';
import { Demo } from './entities/demo.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DemoService {
  constructor(
    @InjectRepository(Demo)
    private readonly demoRepository: Repository<Demo>,
    private readonly dataSource: DataSource,
  ) {}
  async create(createDemoDto: CreateDemoDto) {
    await this.demoRepository.save(createDemoDto);
    console.log('createDemoDto', createDemoDto);
    return 'This action adds a new demo';
  }

  findAll() {
    return `This action returns all demo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} demo`;
  }

  update(id: number, updateDemoDto: UpdateDemoDto) {
    console.log('updateDemoDto', updateDemoDto);
    return `This action updates a #${id} demo`;
  }

  remove(id: number) {
    return `This action removes a #${id} demo`;
  }

  // use transaction to create many demo records 使用事务创建多条记录
  async createMany(createDemoDtoArrays: CreateDemoDto[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(createDemoDtoArrays[0]);
      await queryRunner.manager.save(createDemoDtoArrays[1]);

      await queryRunner.commitTransaction();
    } catch (err) {
      console.error('err', err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
