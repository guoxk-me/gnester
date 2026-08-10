import { spawn } from 'node:child_process';
import { createConnection, createServer } from 'node:net';

function availableLoopbackPort() {
  return new Promise((resolvePort, rejectPort) => {
    const server = createServer();

    server.once('error', rejectPort);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();

      if (!address || typeof address === 'string') {
        server.close();
        rejectPort(new Error('Unable to reserve a loopback port.'));
        return;
      }

      server.close((closeFailure) => {
        if (closeFailure) {
          rejectPort(closeFailure);
          return;
        }

        resolvePort(address.port);
      });
    });
  });
}

function wait(delayMs) {
  return new Promise((resolveWait) => setTimeout(resolveWait, delayMs));
}

function canConnect(port) {
  return new Promise((resolveConnection) => {
    const socket = createConnection({ host: '127.0.0.1', port });

    socket.setTimeout(100);
    socket.once('connect', () => {
      socket.destroy();
      resolveConnection(true);
    });
    socket.once('error', () => resolveConnection(false));
    socket.once('timeout', () => {
      socket.destroy();
      resolveConnection(false);
    });
  });
}

async function stopProcess(childProcess, exitPromise) {
  if (childProcess.pid === undefined) {
    return;
  }

  if (childProcess.exitCode !== null || childProcess.signalCode !== null) {
    return;
  }

  childProcess.kill('SIGTERM');
  const stopped = await Promise.race([
    exitPromise.then(() => true),
    wait(2000).then(() => false),
  ]);

  if (!stopped) {
    childProcess.kill('SIGKILL');
    await exitPromise;
  }
}

const [command, ...commandArguments] = process.argv.slice(2);

if (!command) {
  throw new Error('A command is required after run-with-nats-server.mjs.');
}

const brokerPort = await availableLoopbackPort();
const brokerBinary = process.env.NATS_SERVER_BIN ?? 'nats-server';
const brokerProcess = spawn(
  brokerBinary,
  ['-a', '127.0.0.1', '-p', String(brokerPort)],
  {
    stdio: ['ignore', 'pipe', 'pipe'],
  },
);
let brokerOutput = '';
let brokerStartupFailure;
const brokerExitPromise = new Promise((resolveExit) => {
  brokerProcess.once('exit', (code, signal) => resolveExit({ code, signal }));
});

brokerProcess.once('error', (failure) => {
  brokerStartupFailure = failure;
});
brokerProcess.stdout.on('data', (chunk) => {
  brokerOutput += String(chunk);
});
brokerProcess.stderr.on('data', (chunk) => {
  brokerOutput += String(chunk);
});

try {
  const startupDeadline = Date.now() + 5000;

  // AI modified: integration gates use an isolated real broker and never reuse developer state. / AI 修改：集成门禁使用隔离的真实 broker，绝不复用开发者状态。
  while (Date.now() < startupDeadline) {
    if (brokerStartupFailure) {
      throw brokerStartupFailure;
    }

    if (await canConnect(brokerPort)) {
      break;
    }

    if (brokerProcess.exitCode !== null) {
      throw new Error(`NATS server exited during startup.\n${brokerOutput}`);
    }

    await wait(50);
  }

  if (!(await canConnect(brokerPort))) {
    throw new Error(`NATS server did not become ready.\n${brokerOutput}`);
  }

  const commandProcess = spawn(command, commandArguments, {
    env: {
      ...process.env,
      NATS_SERVERS: `nats://127.0.0.1:${brokerPort}`,
    },
    stdio: 'inherit',
  });
  const commandState = await new Promise((resolveExit, rejectExit) => {
    commandProcess.once('error', rejectExit);
    commandProcess.once('exit', (code, signal) =>
      resolveExit({ code, signal }),
    );
  });

  if (commandState.signal) {
    throw new Error(`Wrapped command exited from ${commandState.signal}.`);
  }

  process.exitCode = commandState.code ?? 1;
} catch (failure) {
  if (failure && typeof failure === 'object' && failure.code === 'ENOENT') {
    throw new Error(
      'nats-server was not found. Install it or set NATS_SERVER_BIN to the official binary path.',
      { cause: failure },
    );
  }

  throw failure;
} finally {
  await stopProcess(brokerProcess, brokerExitPromise);
}
