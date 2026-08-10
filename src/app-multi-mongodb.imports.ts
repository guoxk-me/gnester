import { DynamicModule, Type } from '@nestjs/common';
import { MongooseModule, MongooseModuleAsyncOptions } from '@nestjs/mongoose';
import {
  MongoDatabaseOptions,
  PRIMARY_MONGO_CONNECTION,
  SECONDARY_MONGO_CONNECTION,
} from 'config/config.types';
import {
  primaryMongoConfig,
  secondaryMongoConfig,
} from 'config/mongodb.config';
import { DemoMultiMongodbModule } from './features/demo-multi-mongodb/demo-multi-mongodb.module';

export type AppMongoImport = DynamicModule | Type<unknown>;

function createNamedMongoAsyncOptions(
  connectionName: string,
  provider: ReturnType<typeof primaryMongoConfig.asProvider>,
): MongooseModuleAsyncOptions {
  return {
    connectionName,
    imports: provider.imports,
    inject: provider.inject,
    useFactory: (options: MongoDatabaseOptions) => {
      const { connectionName: ignoredConnectionName, ...mongooseOptions } =
        options;
      void ignoredConnectionName;

      return mongooseOptions;
    },
  };
}

export function createMultiMongoImports(): AppMongoImport[] {
  return [
    MongooseModule.forRootAsync(
      createNamedMongoAsyncOptions(
        PRIMARY_MONGO_CONNECTION,
        primaryMongoConfig.asProvider(),
      ),
    ),
    MongooseModule.forRootAsync(
      createNamedMongoAsyncOptions(
        SECONDARY_MONGO_CONNECTION,
        secondaryMongoConfig.asProvider(),
      ),
    ),
    DemoMultiMongodbModule,
  ];
}
