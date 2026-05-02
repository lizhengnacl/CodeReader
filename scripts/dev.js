import { spawn } from 'child_process';
import os from 'os';
import qrcode from 'qrcode-terminal';

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

const PORT = 5173;
const localIP = getLocalIP();
const url = `http://${localIP}:${PORT}`;

console.log('');
console.log('  ┌─────────────────────────────────────┐');
console.log('  │         🚀 CodeReader 已启动         │');
console.log('  └─────────────────────────────────────┘');
console.log('');
console.log(`  🖥  本地访问:  http://localhost:${PORT}`);
console.log(`  📱 局域网访问: ${url}`);
console.log('');
console.log('  📲 扫描二维码，手机快捷访问:');
console.log('');

qrcode.generate(url, { small: true }, (qr) => {
  const lines = qr.split('\n');
  for (const line of lines) {
    console.log(`      ${line}`);
  }
  console.log('');
  console.log(`      ↗ ${url}`);
  console.log('');
});

const server = spawn('node', ['server/index.js'], { stdio: 'inherit' });
server.on('error', (err) => console.error('Server error:', err.message));

const vite = spawn('npx', ['vite', '--host'], { stdio: 'inherit' });
vite.on('error', (err) => console.error('Vite error:', err.message));

let exiting = false;
const cleanup = () => {
  if (exiting) return;
  exiting = true;
  server.kill();
  vite.kill();
  setTimeout(() => process.exit(0), 100);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
