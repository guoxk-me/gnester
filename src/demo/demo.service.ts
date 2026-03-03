import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateDemoDto } from './dto/create-demo.dto';
import { UpdateDemoDto } from './dto/update-demo.dto';
import { Demo } from './entities/demo.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CronJob } from 'cron';
@Injectable()
export class DemoService {
  private readonly logger = new Logger(DemoService.name);
  constructor(
    @InjectRepository(Demo)
    private readonly demoRepository: Repository<Demo>,
    private readonly dataSource: DataSource,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}
  async create(createDemoDto: CreateDemoDto) {
    await this.demoRepository.save(createDemoDto);
    console.log('createDemoDto', createDemoDto);
    return 'This action adds a new demo';
  }

  findAll() {
    this.cacheManager.set('foo', 'bar', 0);
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
  async createMany(createDemoDtos: CreateDemoDto[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(createDemoDtos[0]);
      await queryRunner.manager.save(createDemoDtos[1]);

      await queryRunner.commitTransaction();
    } catch (err) {
      console.error('err', err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  findManyByIds(ids: number[]) {
    return `This action returns demo records with ids: ${ids.join(', ')}`;
  }

  // use cron expression
  @Cron('45 * * * * *')
  testScheduleTask() {
    this.logger.debug('Called when the current second is 45');
  }

  // use enum
  @Cron(CronExpression.EVERY_10_SECONDS)
  testScheduleEnum() {
    this.logger.debug('Called every 10 seconds');
  }

  // use specific date
  @Cron(new Date(Date.now() + 3000))
  testScheduleDate() {
    this.logger.debug('Called at a specific date');
  }

  //dynamic cron job
  createDynamicCronJob() {
    const job = new CronJob('5 * * * * *', () => {
      this.logger.debug('Called every 5 seconds from dynamic job');
    });
    job.start();
  }
}
