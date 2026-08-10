import { DynamicModule, Type } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { primaryMongoConfig } from 'config/mongodb.config';
import { DemoMongodbModule } from './features/demo-mongodb/demo-mongodb.module';

export type AppMongoImport = DynamicModule | Type<unknown>;

export function createMongoImports(): AppMongoImport[] {
  return [
    MongooseModule.forRootAsync(primaryMongoConfig.asProvider()),
    DemoMongodbModule,
  ];
}
