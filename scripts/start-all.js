const { spawn } = require('node:child_process');
const path = require('node:path');

const files = ['services/users/server.js', 'services/warehouse/server.js', 'services/ia/server.js', 'gateway/server.js'];
const children = files.map((file) => spawn(process.execPath, [path.join(__dirname, '..', file)], { stdio: 'inherit' }));

function stop() {
  children.forEach((child) => child.kill());
  process.exit();
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
