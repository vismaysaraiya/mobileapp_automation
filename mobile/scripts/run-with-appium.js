/**
 * @wdio/appium-service marks Appium "started" as soon as the process spawns,
 * which races ahead of Appium actually binding its HTTP port on this machine
 * (consistently ECONNREFUSED for the first ~5s). This wrapper starts Appium
 * itself, polls /status until it responds, then runs wdio against it - and
 * always tears the Appium process down afterwards.
 */
const { spawn } = require('child_process');
const http = require('http');

// Overridable so a stuck/unkillable orphaned Appium process on the default
// port doesn't block every subsequent run - just set APPIUM_PORT and re-run.
const APPIUM_PORT = Number(process.env.APPIUM_PORT) || 4723;
const READY_TIMEOUT_MS = 30000;

function waitForAppium(port, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const req = http.get(`http://127.0.0.1:${port}/status`, (res) => {
        res.resume();
        if (res.statusCode === 200) return resolve();
        retry();
      });
      req.on('error', retry);
    };
    const retry = () => {
      if (Date.now() > deadline) return reject(new Error('Appium did not become ready in time'));
      setTimeout(attempt, 500);
    };
    attempt();
  });
}

async function main() {
  const appium = spawn('appium', ['--base-path', '/', '--address', '127.0.0.1', '--port', String(APPIUM_PORT)], {
    shell: true,
    stdio: 'inherit',
  });

  const cleanup = () => {
    if (!appium.killed) appium.kill();
  };
  process.on('exit', cleanup);
  process.on('SIGINT', () => {
    cleanup();
    process.exit(130);
  });

  try {
    await waitForAppium(APPIUM_PORT, READY_TIMEOUT_MS);
  } catch (err) {
    console.error(err.message);
    cleanup();
    process.exit(1);
  }

  const wdioArgs = ['wdio', 'run', './mobile/wdio.conf.ts', ...process.argv.slice(2)];
  const wdio = spawn('npx', wdioArgs, {
    shell: true,
    stdio: 'inherit',
    env: { ...process.env, APPIUM_PORT: String(APPIUM_PORT) },
  });

  wdio.on('exit', (code) => {
    cleanup();
    process.exit(code ?? 1);
  });
}

main();
