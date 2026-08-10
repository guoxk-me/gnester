import {
  environmentFilePaths,
  loadProjectEnvironmentFiles,
} from './environment-files';

describe('environmentFilePaths', () => {
  it('loads environment-specific local values before shared values', () => {
    expect(environmentFilePaths('development')).toEqual([
      '.env.development.local',
      '.env.development',
      '.env.local',
      '.env',
    ]);
  });

  it('rejects unsupported environment names', () => {
    expect(() => environmentFilePaths('../production')).toThrow(
      'NODE_ENV must be development, production, test, or provision.',
    );
  });

  it('loads only existing files in precedence order before bootstrap', () => {
    const loadedPaths: string[] = [];

    expect(
      loadProjectEnvironmentFiles(process.cwd(), 'test', (environmentPath) =>
        loadedPaths.push(environmentPath),
      ),
    ).toEqual(['.env.test']);
    expect(loadedPaths).toHaveLength(1);
    expect(loadedPaths[0]).toMatch(/\/\.env\.test$/u);
  });
});
