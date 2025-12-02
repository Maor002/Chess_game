class Logger {
  constructor(level = 'info') {
    this.levels = {
      trace: 0,
      debug: 1,
      info: 2,
      warn: 3,
      error: 4,
    };
    this.setLevel(level);
  }

  setLevel(level) {
    // הגדרת רמת הלוג הנוכחית
    this.currentLevel = this.levels[level] ?? this.levels.info;
  }
// קבלת מיקום הקובץ והשורה שקראה לפונקציית הלוג
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
              file = file.split('?')[0];
              const lineNumber = match[2];
              return `${file}:${lineNumber}`;
            }
          }
        }
      }
    } catch (e) {}
    return "unknown";
  }

  trace(...args) {
    if (this.currentLevel <= this.levels.trace) {
      const location = this.getCallerLocation();
      this.info(`[TRACE] [${location}]`, ...args);
    }
  }

  debug(...args) {
    if (this.currentLevel <= this.levels.debug) {
      const location = this.getCallerLocation();
      this.info(`[DEBUG] [${location}]`, ...args);
    }
  }

  info(...args) {
    if (this.currentLevel <= this.levels.info) {
      console.info(`[INFO]`, ...args);
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

let level = "debug";

export const logger = new Logger(level);

// ניסיון לקרוא את רמת הלוג מהמשתנה הסביבתי
try {
  logger.info(import.meta.env.VITE_LOG_LEVEL);
  if (import.meta.env && import.meta.env.VITE_LOG_LEVEL) {
    level = import.meta.env.VITE_LOG_LEVEL;
    logger.info("Using VITE_LOG_LEVEL:", level);
  } else {
    logger.warn("VITE_LOG_LEVEL not set, using default:", level);
  }
} catch (error) {
  console.error("Error reading environment variable:", error);
}

logger.info("Loaded VITE_LOG_LEVEL:", import.meta.env.VITE_LOG_LEVEL);
