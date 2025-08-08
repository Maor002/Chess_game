export class Logger {
  constructor(level = 'info') {
    this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    this.setLevel(level);
  }

  setLevel(level) {
    this.currentLevel = this.levels[level] ?? this.levels.info;
  }

  // פונקציה עזר לקבלת מיקום הקריאה (גרסה פשוטה)
getCallerLocation() {
  try {
    const err = new Error();
    const stack = err.stack?.split("\n");
    if (stack && stack.length > 3) {
      for (let i = 2; i < stack.length; i++) {
        const line = stack[i];
        if (!line.includes("logger.js")) {
          const match = line.match(/at\s+(.*):(\d+):\d+/);
          if (match) {
            let file = match[1].split('/').pop();
            file = file.split('?')[0]; // מסיר את ?t=...
            const lineNumber = match[2];
            return `${file}:${lineNumber}`;
          }
        }
      }
    }
  } catch (e) {}
  return "unknown";
}



  debug(...args) {
    if (this.currentLevel <= this.levels.debug) {
      const location = this.getCallerLocation();
      console.log(`[DEBUG] [${location}]`, ...args);
    }
  }

  info(...args) {
    if (this.currentLevel <= this.levels.info) {
      console.log(`[INFO]`, ...args);
    }
  }

  warn(...args) {
    if (this.currentLevel <= this.levels.warn) {
      console.warn(`[WARN]`, ...args);
    }
  }

  error(...args) {
    if (this.currentLevel <= this.levels.error) {
      console.error(`[ERROR]`, ...args);
    }
  }
}
let level = "debug"; // שנה ל-'info', 'warn', או 'error' לפי הצורך

try {
  console.log(import.meta.env.VITE_LOG_LEVEL);
  if (import.meta.env && import.meta.env.VITE_LOG_LEVEL) {
    level = import.meta.env.VITE_LOG_LEVEL;
    console.log("Using VITE_LOG_LEVEL:", level);
  } else {
    console.warn("VITE_LOG_LEVEL not set, using default:", level);
  }
} catch (error) {
  console.warn("Error reading environment variable:", error);
}
console.log("Loaded VITE_LOG_LEVEL:", import.meta.env.VITE_LOG_LEVEL);


export const logger = new Logger(level);
