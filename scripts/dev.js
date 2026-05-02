import { spawn } from 'child_process';
import os from 'os';
import qrcode from 'qrcode-terminal';

function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const ipv4 = [];
  const ipv6 = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.internal) continue;
      if (iface.family === 'IPv4') {
        ipv4.push(iface.address);
      }
      if (iface.family === 'IPv6') {
        if (iface.address.startsWith('fe80')) continue;
        if (iface.address.startsWith('fd')) continue;
        if (iface.address.startsWith('fc')) continue;
        ipv6.push(iface.address);
      }
    }
  }
  return { ipv4, ipv6 };
}

const PORT = 5173;
const { ipv4, ipv6 } = getLocalIPs();

const primaryIP = ipv4[0] || '127.0.0.1';
const primaryUrl = `http://${primaryIP}:${PORT}`;

console.log('');
console.log('  ┌─────────────────────────────────────┐');
console.log('  │         🚀 CodeReader 已启动         │');
console.log('  └─────────────────────────────────────┘');
console.log('');
console.log(`  🖥  本地访问:  http://localhost:${PORT}`);

if (ipv4.length > 0) {
  for (const ip of ipv4) {
    console.log(`  📱 IPv4 访问:  http://${ip}:${PORT}`);
  }
}

  const ipv6Public = ipv6.filter(ip => !ip.includes('ff:fe'));
  const ipv6Display = ipv6Public.length > 0 ? [ipv6Public[0]] : ipv6.length > 0 ? [ipv6[0]] : [];

  if (ipv6Display.length > 0) {
    for (const ip of ipv6Display) {
      console.log(`  📱 IPv6 访问:  http://[${ip}]:${PORT}`);
    }
  }

console.log('');
console.log('  📲 扫描二维码，手机快捷访问:');
console.log('');

qrcode.generate(primaryUrl, { small: true }, (qr) => {
  const lines = qr.split('\n');
  for (const line of lines) {
    console.log(`      ${line}`);
  }
  console.log('');
  console.log(`      ↗ ${primaryUrl}`);
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
