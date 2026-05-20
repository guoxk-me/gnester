import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import KeyvRedis from '@keyv/redis';
import configuration from 'config/configuration';
import { validate } from 'config/validation';
import { createMultiDatabaseImports } from './app-multi-database.imports';
import { createSingleDatabaseImports } from './app-single-database.imports';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DemoConfigModule } from './features/demo-config/demo-config.module';
import { DemoDatabaseModule } from './features/demo-database/demo-database.module';

const isMultiDatabaseEnabled = process.env.ENABLE_MULTI_DATABASE === 'true';
const databaseImports = isMultiDatabaseEnabled
  ? createMultiDatabaseImports()
  : createSingleDatabaseImports();

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      ignoreEnvFile: false,
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'],
      isGlobal: true,
      cache: true,
      validate,
    }),
    ...databaseImports,
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get<number>('cache.ttl', 60000),
        stores: [new KeyvRedis(configService.getOrThrow<string>('REDIS_URL'))],
      }),
    }),
    DemoConfigModule,
    DemoDatabaseModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
