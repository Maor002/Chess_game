const fs = require("fs");
const path = require("path");

// Logger class for handling logging with different levels and outputs
class Logger {
  constructor(options = {}) {
    // Available log levels
    this.levels = {
      ERROR:   { value:  0, color: "\x1b[31m" },
      WARN:    { value:  1, color: "\x1b[33m" },
      INFO:    { value:  2, color: "\x1b[36m" },
      SUCCESS: { value:  3, color: "\x1b[32m" },
      DEBUG:   { value:  4, color: "\x1b[35m" },
      TRACE:   { value:  5, color: "\x1b[90m" },
    };

    // Level validation
    const requestedLevel = options.level || "DEBUG";
    this.currentLevel = this.levels[requestedLevel] ? requestedLevel : "DEBUG";

    // Settings
    this.enableFile    = options.enableFile !== false;
    this.enableConsole = options.enableConsole !== false;
    this.logsDir       = options.logsDir || path.join(process.cwd(), "logs");

    this.resetColor = "\x1b[0m";

    // Create logs folder if needed
    if (this.enableFile && !fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  // Helpers

  getTimestamp() {
    const now = new Date();

    const date = now.toLocaleDateString("he-IL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    const time = now.toLocaleTimeString("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    return { date, time, full: `${date} ${time}` };
  }

  shouldLog(level) {
    if (!this.levels[level]) {
      console.error(`[Logger] Invalid log level: ${level}, using INFO`);
      level = "INFO";
    }

    if (!this.levels[this.currentLevel]) {
      console.error(`[Logger] Invalid current level: ${this.currentLevel}, using INFO`);
      this.currentLevel = "INFO";
    }

    return this.levels[level].value <= this.levels[this.currentLevel].value;
  }

  formatMessage(level, message, context = {}) {
    const timestamp = this.getTimestamp();

    if (!this.levels[level]) {
      console.error(`[Logger] Invalid level in formatMessage: ${level}`);
      level = "INFO";
    }

    const lvl = this.levels[level];
    const color = lvl.color || "";

    const baseConsole = `${color}[${timestamp.full}] [${level}]${this.resetColor}: ${message}`;
    const baseFile    = `[${timestamp.full}] [${level}]: ${message}`;

    let contextStr = "";
    if (context && Object.keys(context).length > 0) {
      try {
        contextStr = "\n" + JSON.stringify(context, null, 2);
      } catch {
        contextStr = "\n[Error serializing context]";
      }
    }

    return {
      console: baseConsole + contextStr,
      file:    baseFile + contextStr,
      timestamp,
    };
  }

  writeToFile(level, msg, timestamp) {
    if (!this.enableFile) return;

    const fileName = `${timestamp.date.replace(/\//g, "-")}.log`;
    const filePath = path.join(this.logsDir, fileName);

    try {
      fs.appendFileSync(filePath, msg + "\n", "utf8");
    } catch (err) {
      console.error("[Logger] Error writing to log file:", err.message);
    }
  }

  // Core Logger

  log(level, message, context = {}) {
    if (!this.shouldLog(level)) return;

    // If message is an object
    if (typeof message === "object" && message !== null) {
      context = message;
      message = "Object logged:";
    }

    if (message === undefined || message === null) {
      message = "[undefined/null message]";
    }

    message = String(message);

    const formatted = this.formatMessage(level, message, context);

    if (this.enableConsole) {
      console.log(formatted.console);
    }

    if (this.enableFile) {
      this.writeToFile(level, formatted.file, formatted.timestamp);
    }
  }

  // Shortcut functions
  trace(msg, context)   { this.log("TRACE", msg, context); }
  error(msg, context)   { this.log("ERROR", msg, context); }
  warn(msg, context)    { this.log("WARN", msg, context); }
  info(msg, context)    { this.log("INFO", msg, context); }
  success(msg, context) { this.log("SUCCESS", msg, context); }
  debug(msg, context)   { this.log("DEBUG", msg, context); }

  // Change log level at runtime
  setLevel(level) {
    if (this.levels[level]) {
      const old = this.currentLevel;
      this.currentLevel = level;
      this.info(`Log level changed from ${old} to ${level}`);
      return true;
    }

    this.warn(`Invalid log level: ${level}. Available: ${Object.keys(this.levels).join(", ")}`);
    return false;
  }

  getLevel() {
    return this.currentLevel;
  }

  getLevels() {
    return Object.keys(this.levels);
  }

  //Maintenance - delete logs older than X days
  cleanOldLogs(daysToKeep = 7) {
    if (!this.enableFile) return;

    try {
      const files = fs.readdirSync(this.logsDir);
      const now = Date.now();
      const maxAge = daysToKeep * 24 * 60 * 60 * 1000;

      let deleted = 0;

      files.forEach((file) => {
        const filePath = path.join(this.logsDir, file);
        const stats = fs.statSync(filePath);

        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
          deleted++;
          this.info(`Deleted old log file: ${file}`);
        }
      });

      this.info(
        deleted === 0
          ? `No log files older than ${daysToKeep} days`
          : `Deleted ${deleted} log file(s)`
      );

    } catch (err) {
      this.error("Error cleaning old logs", { error: err.message });
    }
  }
}

// Singleton instance

const logger = new Logger({
  level: process.env.LOG_LEVEL || "INFO",
  enableFile: process.env.LOG_TO_FILE !== "false",
  enableConsole: true,
  logsDir: path.join(process.cwd(), "logs"),
});

module.exports = logger;
