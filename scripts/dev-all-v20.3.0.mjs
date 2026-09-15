import { spawn } from 'node:child_process';

const isWindows = process.platform === 'win32';
const children = [];
let stopping = false;

function run(label, workspace) {
  // Windows/Node 24 can return EINVAL when spawning npm.cmd directly with shell:false.
  // Use the platform shell only on Windows; POSIX keeps direct npm execution.
  const command = isWindows ? `npm --workspace ${workspace} run dev` : 'npm';
  const args = isWindows ? [] : ['--workspace', workspace, 'run', 'dev'];
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: isWindows,
    env: process.env,
  });
  children.push(child);
  child.on('error', (error) => {
    console.error(`[${label}] no pudo iniciar: ${error.message}`);
    shutdown(1);
  });
  child.on('exit', (code, signal) => {
    if (!stopping && code && code !== 0) {
      console.error(`[${label}] terminó con código ${code}${signal ? ` (${signal})` : ''}.`);
      shutdown(code);
    }
  });
}

function shutdown(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (!child.killed) child.kill();
  }
  setTimeout(() => process.exit(code), 250).unref?.();
}

console.log('BuzzBee v20.3.2 · iniciando API + WEB');
run('API', '@erp/api');
run('WEB', '@erp/web');
process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
