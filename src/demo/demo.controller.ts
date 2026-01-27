import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
  ParseArrayPipe,
  Query,
  UseInterceptors,
  SerializeOptions,
  ClassSerializerInterceptor,
  Version,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { DemoService } from './demo.service';
import { CreateDemoDto } from './dto/create-demo.dto';
import { UpdateDemoDto } from './dto/update-demo.dto';
import { Demo } from './entities/demo.entity';

@Controller({
  // version: '1',
  // cancel versioning for this controller
  version: VERSION_NEUTRAL,
  path: 'demo',
})
export class DemoController {
  constructor(private readonly demoService: DemoService) {}

  @Post()
  create(@Body() createDemoDto: CreateDemoDto) {
    return this.demoService.create(createDemoDto);
  }

  @Version('2')
  @Get()
  findAll() {
    return this.demoService.findAll();
  }

  // use SerializeOptions to exclude properties with specified prefixes
  @SerializeOptions({
    // exclude properties with prefix '_'
    excludePrefixes: ['_'],
    // use type Demo to specify the class for serialization
    type: Demo,
  })
  // use ClassSerializerInterceptor to enable class-transformer decorators
  @UseInterceptors(ClassSerializerInterceptor)
  // transform id to number using ParseIntPipe
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.demoService.findOne(id);
  }

  @Patch(':id')
  // Implicit conversion with transform option in ValidationPipe
  update(@Param('id') id: number, @Body() updateDemoDto: UpdateDemoDto) {
    return this.demoService.update(id, updateDemoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.demoService.remove(+id);
  }

  @Get()
  findManyByIds(
    @Query('ids', new ParseArrayPipe({ items: Number, separator: ',' }))
    ids: number[],
  ) {
    return this.demoService.findManyByIds(ids);
  }

  @Post()
  createMany(
    // use ParseArrayPipe to validate an array of CreateDemoDto
    @Body(new ParseArrayPipe({ items: CreateDemoDto }))
    createDemoDtos: CreateDemoDto[],
  ) {
    return this.demoService.createMany(createDemoDtos);
  }
}
