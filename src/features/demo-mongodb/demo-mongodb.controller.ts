import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateDemoMongoDto } from './dto/create-demo-mongo.dto';
import { UpdateDemoMongoDto } from './dto/update-demo-mongo.dto';
import { DemoMongodbService } from './demo-mongodb.service';
import { DemoMongo } from './schemas/demo-mongo.schema';

@Controller('demo-mongodb')
export class DemoMongodbController {
  constructor(private readonly demoMongodbService: DemoMongodbService) {}

  @Post()
  create(@Body() createDemoMongoDto: CreateDemoMongoDto): Promise<DemoMongo> {
    return this.demoMongodbService.create(createDemoMongoDto);
  }

  @Post('many')
  createMany(
    @Body() createDemoMongoDtos: CreateDemoMongoDto[],
  ): Promise<DemoMongo[]> {
    return this.demoMongodbService.createMany(createDemoMongoDtos);
  }

  @Get()
  findAll(): Promise<DemoMongo[]> {
    return this.demoMongodbService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<DemoMongo> {
    return this.demoMongodbService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDemoMongoDto: UpdateDemoMongoDto,
  ): Promise<DemoMongo> {
    return this.demoMongodbService.update(id, updateDemoMongoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.demoMongodbService.remove(id);
  }
}
