#!/usr/bin/env node

const { execSync } = require('child_process');
const os = require('os');

const PORT = process.env.PORT || 3001;

try {
  if (os.platform() === 'win32') {
    // Windows
    try {
      const output = execSync(`netstat -ano | findstr :${PORT}`, { encoding: 'utf-8' }).trim();
      if (output) {
        const lines = output.split('\n');
        const pids = new Set();
        lines.forEach(line => {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && !isNaN(pid)) {
            pids.add(pid);
          }
        });

        pids.forEach(pid => {
          try {
            console.log(`Killing PID ${pid}...`);
            execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
            console.log(`✅ Killed PID ${pid}`);
          } catch (e) {
            // Ignore errors
          }
        });
      }
    } catch (e) {
      // No process found
    }
  } else {
    // Mac/Linux
    try {
      execSync(`lsof -ti:${PORT} | xargs kill -9 2>/dev/null || true`, { stdio: 'ignore' });
      console.log(`✅ Killed process on port ${PORT}`);
    } catch (e) {
      // Ignore
    }
  }

  console.log(`✅ Port ${PORT} is ready`);
  process.exit(0);
} catch (err) {
  console.error(`❌ Error:`, err.message);
  process.exit(1);
}
