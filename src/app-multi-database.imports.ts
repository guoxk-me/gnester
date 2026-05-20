import { DynamicModule, Type } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  primaryDatabaseConfig,
  secondaryDatabaseConfig,
} from 'config/database.config';
import { SECONDARY_DATA_SOURCE } from 'config/config.types';
import { DemoMultiDatabaseModule } from './features/demo-multi-database/demo-multi-database.module';

export type AppDatabaseImport = DynamicModule | Type<unknown>;

export function createMultiDatabaseImports(): AppDatabaseImport[] {
  return [
    TypeOrmModule.forRootAsync(primaryDatabaseConfig.asProvider()),
    TypeOrmModule.forRootAsync({
      name: SECONDARY_DATA_SOURCE,
      ...secondaryDatabaseConfig.asProvider(),
    }),
    DemoMultiDatabaseModule,
  ];
}
