import { appFeatures } from './app-features';
import { DemoMultiDatabaseModule } from './features/demo-multi-database/demo-multi-database.module';
import {
  AppModule,
  createDatabaseFeatureImports,
  createDatabaseImports,
} from './app.module';
import { DemoDatabaseModule } from './features/demo-database/demo-database.module';

describe('AppModule', () => {
  it('keeps feature flags in code instead of env-driven module registration', () => {
    expect(appFeatures).toEqual({
      enableDatabase: true,
      enableMultiDatabase: false,
      enableMongodb: false,
      enableMultiMongodb: false,
    });
  });

  it('keeps the secondary database disabled until explicitly configured', () => {
    const moduleMetadata = Reflect.getMetadata(
      'imports',
      AppModule,
    ) as unknown[];

    expect(moduleMetadata).not.toContain(DemoMultiDatabaseModule);
  });

  it('skips the regular database demo module when database is disabled', () => {
    expect(
      createDatabaseFeatureImports({
        enableDatabase: false,
        enableMultiDatabase: true,
        enableMongodb: false,
        enableMultiMongodb: false,
      }),
    ).not.toContain(DemoDatabaseModule);
  });

  it('skips TypeORM imports when database is disabled', () => {
    expect(
      createDatabaseImports({
        enableDatabase: false,
        enableMultiDatabase: true,
        enableMongodb: false,
        enableMultiMongodb: false,
      }),
    ).toEqual([]);
  });
});
