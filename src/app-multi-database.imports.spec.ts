import { TypeOrmModule } from '@nestjs/typeorm';
import { SECONDARY_DATA_SOURCE } from 'config/config.types';
import { createMultiDatabaseImports } from './app-multi-database.imports';

describe('createMultiDatabaseImports', () => {
  it('registers the secondary data source name at the async options top level', () => {
    const forRootAsyncSpy = jest.spyOn(TypeOrmModule, 'forRootAsync');

    createMultiDatabaseImports();

    expect(forRootAsyncSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: SECONDARY_DATA_SOURCE,
      }),
    );

    forRootAsyncSpy.mockRestore();
  });
});
