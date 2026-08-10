import { DynamicModule, Module, Type } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import KeyvRedis from '@keyv/redis';
import configuration from 'config/configuration';
import { environmentFilePaths } from 'config/environment-files';
import { validate } from 'config/validation';
import { appFeatures, AppFeatureFlags } from './app-features';
import { createMultiDatabaseImports } from './app-multi-database.imports';
import { createMultiMongoImports } from './app-multi-mongodb.imports';
import { createMongoImports } from './app-mongodb.imports';
import { createSingleDatabaseImports } from './app-single-database.imports';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DemoConfigModule } from './features/demo-config/demo-config.module';
import { DemoDatabaseModule } from './features/demo-database/demo-database.module';
import { DemoGreetingGatewayModule } from './examples/demo-greeting/gateway/demo-greeting-gateway.module';

export function createDatabaseImports(
  features: AppFeatureFlags,
): Array<DynamicModule | Type<unknown>> {
  if (!features.enableDatabase) {
    return [];
  }

  return features.enableMultiDatabase
    ? createMultiDatabaseImports()
    : createSingleDatabaseImports();
}

export function createDatabaseFeatureImports(
  features: AppFeatureFlags,
): Array<Type<unknown>> {
  return features.enableDatabase ? [DemoDatabaseModule] : [];
}

const databaseImports = createDatabaseImports(appFeatures);
const databaseFeatureImports = createDatabaseFeatureImports(appFeatures);
const mongodbImports = appFeatures.enableMongodb
  ? appFeatures.enableMultiMongodb
    ? createMultiMongoImports()
    : createMongoImports()
  : [];

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      ignoreEnvFile: false,
      envFilePath: environmentFilePaths(),
      isGlobal: true,
      cache: true,
      validate,
    }),
    ...databaseImports,
    ...mongodbImports,
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get<number>('cache.ttl', 60000),
        stores: [new KeyvRedis(configService.getOrThrow<string>('REDIS_URL'))],
      }),
    }),
    // AI modified: the gateway crosses the remote-owned seam only through the Demo greeting port. / AI 修改：gateway 仅通过 Demo greeting 端口跨越自有远程 seam。
    DemoGreetingGatewayModule,
    DemoConfigModule,
    ...databaseFeatureImports,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
