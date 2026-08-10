import { existsSync } from 'node:fs';
import { isAbsolute, relative, resolve, sep } from 'node:path';
import { loadEnvFile } from 'node:process';
import { Environment } from './config.types';

const supportedEnvironments = new Set<string>(Object.values(Environment));

export function environmentFilePaths(
  nodeEnv: string = process.env.NODE_ENV ?? Environment.Development,
): string[] {
  // AI modified: reject untrusted path segments before they participate in dotenv discovery. / AI 修改：在不可信路径片段参与 dotenv 查找前拒绝它们。
  if (!supportedEnvironments.has(nodeEnv)) {
    throw new Error(
      'NODE_ENV must be development, production, test, or provision.',
    );
  }

  return [`.env.${nodeEnv}.local`, `.env.${nodeEnv}`, '.env.local', '.env'];
}

export function loadProjectEnvironmentFiles(
  projectDirectory: string = process.cwd(),
  nodeEnv: string = process.env.NODE_ENV ?? Environment.Development,
  loadEnvironmentFile: (path: string) => void = loadEnvFile,
): string[] {
  const loadedEnvironmentFiles: string[] = [];
  const projectRoot = resolve(projectDirectory);

  // AI modified: load highest-priority files first because Node preserves existing environment keys. / AI 修改：由于 Node 会保留已有环境变量，先加载高优先级文件。
  for (const environmentFile of environmentFilePaths(nodeEnv)) {
    const environmentFilePath = resolve(projectRoot, environmentFile);
    const projectRelativePath = relative(projectRoot, environmentFilePath);

    // AI modified: keep every resolved environment file inside the selected project root. / AI 修改：确保解析后的环境文件始终位于选定项目根目录内。
    if (
      projectRelativePath === '..' ||
      projectRelativePath.startsWith(`..${sep}`) ||
      isAbsolute(projectRelativePath)
    ) {
      throw new Error(
        'Environment file paths must remain within the project directory.',
      );
    }

    if (!existsSync(environmentFilePath)) {
      continue;
    }

    loadEnvironmentFile(environmentFilePath);
    loadedEnvironmentFiles.push(environmentFile);
  }

  return loadedEnvironmentFiles;
}
