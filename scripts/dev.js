import { spawn } from 'child_process';

const server = spawn('node', ['server/index.js'], { stdio: 'inherit' });
const vite = spawn('npx', ['vite'], { stdio: 'inherit' });

process.on('SIGINT', () => {
  server.kill();
  vite.kill();
  process.exit();
});
