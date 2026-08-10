import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);
const { ClientProxyFactory, Transport } = require('@nestjs/microservices');
const { firstValueFrom, timeout } = require('rxjs');
const projectRoot = process.cwd();
const {
  DEMO_GREETING_CONTRACT_VERSION,
  DEMO_GREETING_MESSAGE_PATTERNS,
  DEMO_GREETING_SERVICE_NAME,
} = require(
  resolve(projectRoot, 'dist/src/contracts/demo-greeting.contract.js'),
);
const serviceEntrypoint = resolve(
  projectRoot,
  'dist/src/processes/demo-greeting-service.main.js',
);
const natsServers = process.env.NATS_SERVERS?.split(',').map((serverUrl) =>
  serverUrl.trim(),
);

if (!natsServers || natsServers.length === 0) {
  throw new Error(
    'NATS_SERVERS is required for production-start verification.',
  );
}

function wait(delayMs) {
  return new Promise((resolveWait) => setTimeout(resolveWait, delayMs));
}

const serviceProcess = spawn(process.execPath, [serviceEntrypoint], {
  cwd: projectRoot,
  env: {
    ...process.env,
    DEMO_GREETING_NATS_GRACE_PERIOD_MS: '0',
    NATS_CONNECTION_TIMEOUT_MS: '1000',
    NODE_ENV: 'production',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let startupOutput = '';
let exitState;
const exitPromise = new Promise((resolveExit) => {
  serviceProcess.once('exit', (code, signal) => {
    exitState = { code, signal };
    resolveExit(exitState);
  });
});

serviceProcess.stdout.on('data', (chunk) => {
  startupOutput += String(chunk);
});
serviceProcess.stderr.on('data', (chunk) => {
  startupOutput += String(chunk);
});

const client = ClientProxyFactory.create({
  transport: Transport.NATS,
  options: {
    name: 'gnester-production-start-verifier',
    servers: natsServers,
    timeout: 1000,
    waitOnFirstConnect: true,
  },
});

try {
  await client.connect();
  const startupDeadline = Date.now() + 7000;
  let readinessPayload;

  // AI modified: verify the compiled composition root through its real NATS message interface. / AI 修改：通过真实 NATS 消息 interface 验证编译后的装配根。
  while (Date.now() < startupDeadline) {
    if (exitState) {
      throw new Error(`Demo service exited during startup.\n${startupOutput}`);
    }

    try {
      readinessPayload = await firstValueFrom(
        client
          .send(DEMO_GREETING_MESSAGE_PATTERNS.health, {
            contractVersion: DEMO_GREETING_CONTRACT_VERSION,
          })
          .pipe(timeout(500)),
      );
      break;
    } catch {
      // Startup polling intentionally retries until the bounded deadline. / 启动轮询会在有界截止时间前按预期重试。
    }

    await wait(50);
  }

  if (
    !readinessPayload ||
    readinessPayload.contractVersion !== DEMO_GREETING_CONTRACT_VERSION ||
    readinessPayload.service !== DEMO_GREETING_SERVICE_NAME ||
    readinessPayload.status !== 'up'
  ) {
    throw new Error(`Demo service readiness failed.\n${startupOutput}`);
  }

  await client.close();
  serviceProcess.kill('SIGTERM');
  const shutdownState = await Promise.race([
    exitPromise,
    wait(5000).then(() => undefined),
  ]);

  if (!shutdownState) {
    serviceProcess.kill('SIGKILL');
    throw new Error('Demo service did not stop within 5000ms.');
  }

  if (shutdownState.code !== 0 && shutdownState.signal !== 'SIGTERM') {
    throw new Error(
      `Demo service shutdown failed with code ${String(shutdownState.code)} and signal ${String(shutdownState.signal)}.`,
    );
  }

  console.log('Demo service production-start verification passed.');
} catch (failure) {
  await client.close();

  if (!exitState) {
    serviceProcess.kill('SIGKILL');
    await exitPromise;
  }

  throw failure;
}
