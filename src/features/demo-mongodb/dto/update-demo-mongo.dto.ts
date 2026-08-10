import { PartialType } from '@nestjs/mapped-types';
import { CreateDemoMongoDto } from './create-demo-mongo.dto';

export class UpdateDemoMongoDto extends PartialType(CreateDemoMongoDto) {}
