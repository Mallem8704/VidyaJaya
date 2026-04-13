// Automatically routing Render's default "node index.js" command to the server directory
const { spawn } = require('child_process');
const path = require('path');

console.log('==> Forwarding "node index.js" to the server directory...');

// Spawn the node process inside the 'server' directory
const serverProcess = spawn('node', ['index.js'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit' // This ensures logs go to Render's console
});

serverProcess.on('error', (err) => {
  console.error('Failed to start server:', err);
});
