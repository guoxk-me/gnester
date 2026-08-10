import { access, readFile, readdir } from 'node:fs/promises';
import { relative, resolve } from 'node:path';

const projectRoot = process.cwd();
const outputRoot = resolve(projectRoot, 'dist');
const requiredArtifacts = [
  'dist/config/config.yaml',
  'dist/src/main.js',
  'dist/src/processes/demo-greeting-service.main.js',
];

async function artifactFiles(directory) {
  const directoryEntries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    directoryEntries.map(async (directoryEntry) => {
      const entryPath = resolve(directory, directoryEntry.name);

      return directoryEntry.isDirectory()
        ? artifactFiles(entryPath)
        : [relative(projectRoot, entryPath)];
    }),
  );

  return nestedFiles.flat();
}

await Promise.all(
  requiredArtifacts.map((artifactPath) =>
    access(resolve(projectRoot, artifactPath)),
  ),
);

const packageJson = JSON.parse(
  await readFile(resolve(projectRoot, 'package.json'), 'utf8'),
);
const expectedEntrypoints = {
  'start:demo-service:prod':
    'NODE_ENV=production node dist/src/processes/demo-greeting-service.main',
  'start:prod': 'NODE_ENV=production node dist/src/main',
};

for (const [scriptName, expectedCommand] of Object.entries(
  expectedEntrypoints,
)) {
  // AI modified: production scripts and compiled entrypoints must move together. / AI 修改：生产脚本与编译入口必须同步移动。
  if (packageJson.scripts?.[scriptName] !== expectedCommand) {
    throw new Error(`${scriptName} does not target its compiled entrypoint.`);
  }
}

const unexpectedTestArtifacts = (await artifactFiles(outputRoot)).filter(
  (artifactPath) =>
    artifactPath.endsWith('.spec.js') || artifactPath.endsWith('.e2e-spec.js'),
);

if (unexpectedTestArtifacts.length > 0) {
  throw new Error(
    `Build artifact contains test files: ${unexpectedTestArtifacts.join(', ')}`,
  );
}

console.log('Build artifact verification passed.');
