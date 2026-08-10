import { readdir, readFile } from 'node:fs/promises';
import { isBuiltin } from 'node:module';
import { dirname, relative, resolve, sep } from 'node:path';
import ts from 'typescript';

const projectRoot = process.cwd();
const sourceRoot = resolve(projectRoot, 'src');
const bootstrapRoot = resolve(sourceRoot, 'bootstrap');
const httpBootstrapRoot = resolve(bootstrapRoot, 'http');
const contractsRoot = resolve(sourceRoot, 'contracts');
const examplesRoot = resolve(sourceRoot, 'examples');
const featuresRoot = resolve(sourceRoot, 'features');
const platformRoot = resolve(sourceRoot, 'platform');
const processesRoot = resolve(sourceRoot, 'processes');
const architectureViolations = [];
const tsconfigPath = resolve(projectRoot, 'tsconfig.json');
const tsconfig = ts.readConfigFile(tsconfigPath, ts.sys.readFile);

if (tsconfig.error) {
  throw new Error(
    ts.flattenDiagnosticMessageText(tsconfig.error.messageText, '\n'),
  );
}

const compilerOptions = ts.parseJsonConfigFileContent(
  tsconfig.config,
  ts.sys,
  projectRoot,
).options;

function isInside(candidatePath, expectedRoot) {
  return (
    candidatePath === expectedRoot ||
    candidatePath.startsWith(`${expectedRoot}${sep}`)
  );
}

async function listTypeScriptFiles(directory) {
  let directoryEntries;

  try {
    directoryEntries = await readdir(directory, { withFileTypes: true });
  } catch (failure) {
    if (failure && typeof failure === 'object' && failure.code === 'ENOENT') {
      return [];
    }

    throw failure;
  }

  const nestedFiles = await Promise.all(
    directoryEntries.map(async (directoryEntry) => {
      const entryPath = resolve(directory, directoryEntry.name);

      if (directoryEntry.isDirectory()) {
        return listTypeScriptFiles(entryPath);
      }

      return directoryEntry.isFile() && directoryEntry.name.endsWith('.ts')
        ? [entryPath]
        : [];
    }),
  );

  return nestedFiles.flat();
}

function moduleSpecifiers(sourceFile) {
  const specifiers = [];

  function visit(node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteralLike(node.moduleSpecifier)
    ) {
      specifiers.push(node.moduleSpecifier.text);
    }

    if (ts.isCallExpression(node)) {
      const isDynamicModuleLoad =
        node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) &&
          node.expression.text === 'require');

      if (isDynamicModuleLoad) {
        // AI modified: protected layers fail closed when a dependency cannot be resolved statically. / AI 修改：受保护层的依赖无法静态解析时执行失败关闭。
        if (
          node.arguments.length !== 1 ||
          !ts.isStringLiteralLike(node.arguments[0])
        ) {
          throw new Error(
            `${relative(projectRoot, sourceFile.fileName)} uses a non-literal dynamic module specifier`,
          );
        }

        specifiers.push(node.arguments[0].text);
      }
    }

    if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference) &&
      node.moduleReference.expression &&
      ts.isStringLiteralLike(node.moduleReference.expression)
    ) {
      specifiers.push(node.moduleReference.expression.text);
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return specifiers;
}

function usesGlobalDecorator(sourceFile) {
  const directBindings = new Set();
  const namespaceBindings = new Set();

  for (const statement of sourceFile.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteralLike(statement.moduleSpecifier) ||
      statement.moduleSpecifier.text !== '@nestjs/common'
    ) {
      continue;
    }

    const importBindings = statement.importClause?.namedBindings;

    if (importBindings && ts.isNamedImports(importBindings)) {
      for (const importElement of importBindings.elements) {
        if (
          (importElement.propertyName ?? importElement.name).text === 'Global'
        ) {
          directBindings.add(importElement.name.text);
        }
      }
    }

    if (importBindings && ts.isNamespaceImport(importBindings)) {
      namespaceBindings.add(importBindings.name.text);
    }
  }

  let hasGlobalDecorator = false;

  function visit(node) {
    if (ts.isDecorator(node) && ts.isCallExpression(node.expression)) {
      const decoratorTarget = node.expression.expression;
      const isDirectGlobal =
        ts.isIdentifier(decoratorTarget) &&
        directBindings.has(decoratorTarget.text);
      const isNamespaceGlobal =
        ts.isPropertyAccessExpression(decoratorTarget) &&
        decoratorTarget.name.text === 'Global' &&
        ts.isIdentifier(decoratorTarget.expression) &&
        namespaceBindings.has(decoratorTarget.expression.text);

      if (isDirectGlobal || isNamespaceGlobal) {
        hasGlobalDecorator = true;
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return hasGlobalDecorator;
}

function dependencyPath(sourcePath, moduleSpecifier) {
  if (isBuiltin(moduleSpecifier)) {
    return undefined;
  }

  const resolvedModule = ts.resolveModuleName(
    moduleSpecifier,
    sourcePath,
    compilerOptions,
    ts.sys,
  ).resolvedModule;

  if (resolvedModule) {
    return resolve(resolvedModule.resolvedFileName);
  }

  return moduleSpecifier.startsWith('.')
    ? resolve(dirname(sourcePath), moduleSpecifier)
    : undefined;
}

function pathSegments(candidatePath, expectedRoot) {
  if (!isInside(candidatePath, expectedRoot)) {
    return [];
  }

  return relative(expectedRoot, candidatePath).split(sep);
}

async function parsedFiles(directory) {
  const sourceFiles = await listTypeScriptFiles(directory);

  return Promise.all(
    sourceFiles.map(async (sourcePath) => ({
      sourcePath,
      sourceText: await readFile(sourcePath, 'utf8'),
    })),
  );
}

async function verifyContracts() {
  for (const contractFile of await parsedFiles(contractsRoot)) {
    const sourceFile = ts.createSourceFile(
      contractFile.sourcePath,
      contractFile.sourceText,
      ts.ScriptTarget.Latest,
      true,
    );

    for (const moduleSpecifier of moduleSpecifiers(sourceFile)) {
      const resolvedDependency = dependencyPath(
        contractFile.sourcePath,
        moduleSpecifier,
      );
      const isInternalContract =
        resolvedDependency && isInside(resolvedDependency, contractsRoot);

      if (!isBuiltin(moduleSpecifier) && !isInternalContract) {
        architectureViolations.push(
          `${relative(projectRoot, contractFile.sourcePath)} imports non-contract ${moduleSpecifier}`,
        );
      }
    }
  }
}

async function verifyPlatform() {
  for (const platformFile of await parsedFiles(platformRoot)) {
    const sourceFile = ts.createSourceFile(
      platformFile.sourcePath,
      platformFile.sourceText,
      ts.ScriptTarget.Latest,
      true,
    );

    if (usesGlobalDecorator(sourceFile)) {
      architectureViolations.push(
        `${relative(projectRoot, platformFile.sourcePath)} uses @Global()`,
      );
    }

    for (const moduleSpecifier of moduleSpecifiers(sourceFile)) {
      const resolvedDependency = dependencyPath(
        platformFile.sourcePath,
        moduleSpecifier,
      );

      if (!resolvedDependency) {
        continue;
      }

      if (
        isInside(resolvedDependency, bootstrapRoot) ||
        isInside(resolvedDependency, examplesRoot) ||
        isInside(resolvedDependency, processesRoot)
      ) {
        architectureViolations.push(
          `${relative(projectRoot, platformFile.sourcePath)} imports application code ${moduleSpecifier}`,
        );
      }
    }
  }
}

async function verifyExampleProcessIsolation() {
  for (const exampleFile of await parsedFiles(examplesRoot)) {
    const sourceFile = ts.createSourceFile(
      exampleFile.sourcePath,
      exampleFile.sourceText,
      ts.ScriptTarget.Latest,
      true,
    );

    for (const moduleSpecifier of moduleSpecifiers(sourceFile)) {
      const resolvedDependency = dependencyPath(
        exampleFile.sourcePath,
        moduleSpecifier,
      );

      if (!resolvedDependency) {
        continue;
      }

      const sourceSegments = pathSegments(exampleFile.sourcePath, examplesRoot);
      const dependencySegments = pathSegments(resolvedDependency, examplesRoot);
      const crossesGatewayToService =
        sourceSegments.includes('gateway') &&
        dependencySegments.includes('service');
      const crossesServiceToGateway =
        sourceSegments.includes('service') &&
        dependencySegments.includes('gateway');

      // AI modified: deployable sides may share contracts but not each other's private implementation. / AI 修改：可部署双方可共享契约，但不能共享彼此私有实现。
      if (crossesGatewayToService || crossesServiceToGateway) {
        architectureViolations.push(
          `${relative(projectRoot, exampleFile.sourcePath)} crosses a deployable implementation seam via ${moduleSpecifier}`,
        );
      }
    }
  }
}

async function verifyDemoGreetingProcessIsolation() {
  for (const processFile of await parsedFiles(processesRoot)) {
    if (!processFile.sourcePath.includes('demo-greeting-service')) {
      continue;
    }

    const sourceFile = ts.createSourceFile(
      processFile.sourcePath,
      processFile.sourceText,
      ts.ScriptTarget.Latest,
      true,
    );

    for (const moduleSpecifier of moduleSpecifiers(sourceFile)) {
      const resolvedDependency = dependencyPath(
        processFile.sourcePath,
        moduleSpecifier,
      );

      if (!resolvedDependency) {
        continue;
      }

      const dependencySegments = pathSegments(resolvedDependency, examplesRoot);
      const sourceRelativePath = relative(sourceRoot, resolvedDependency);
      const importsGatewayComposition =
        !sourceRelativePath.includes(sep) &&
        sourceRelativePath.startsWith('app');
      const importsHttpBootstrap = isInside(
        resolvedDependency,
        httpBootstrapRoot,
      );

      // AI modified: the reference service cannot silently reacquire legacy gateway infrastructure. / AI 修改：参考 service 不得静默重新获取旧 gateway 基础设施。
      if (
        isInside(resolvedDependency, featuresRoot) ||
        dependencySegments.includes('gateway') ||
        importsHttpBootstrap ||
        importsGatewayComposition
      ) {
        architectureViolations.push(
          `${relative(projectRoot, processFile.sourcePath)} imports gateway-owned code ${moduleSpecifier}`,
        );
      }
    }
  }
}

await verifyContracts();
await verifyPlatform();
await verifyExampleProcessIsolation();
await verifyDemoGreetingProcessIsolation();

if (architectureViolations.length > 0) {
  for (const violation of architectureViolations) {
    console.error(`Architecture violation: ${violation}`);
  }

  process.exitCode = 1;
} else {
  console.log('Architecture verification passed.');
}
