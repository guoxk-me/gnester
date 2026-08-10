import { MongooseModule } from '@nestjs/mongoose';
import {
  PRIMARY_MONGO_CONNECTION,
  SECONDARY_MONGO_CONNECTION,
} from 'config/config.types';
import { createMultiMongoImports } from './app-multi-mongodb.imports';

describe('createMultiMongoImports', () => {
  it('registers named primary and secondary Mongo connections', () => {
    const forRootAsyncSpy = jest.spyOn(MongooseModule, 'forRootAsync');

    createMultiMongoImports();

    expect(forRootAsyncSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        connectionName: PRIMARY_MONGO_CONNECTION,
      }),
    );
    expect(forRootAsyncSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        connectionName: SECONDARY_MONGO_CONNECTION,
      }),
    );

    forRootAsyncSpy.mockRestore();
  });
});
