import { DynamicModule, Type } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { primaryDatabaseConfig } from 'config/database.config';

export type AppDatabaseImport = DynamicModule | Type<unknown>;

export function createSingleDatabaseImports(): AppDatabaseImport[] {
  return [TypeOrmModule.forRootAsync(primaryDatabaseConfig.asProvider())];
}
