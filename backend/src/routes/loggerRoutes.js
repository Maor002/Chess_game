/**
 * Logger API Routes
 * ------------------
 * Routes for:
 *  - getting current log level
 *  - setting log level
 *  - viewing log stats
 *  - cleaning old logs
 */

const express = require("express");
const logger = require("../logger/logger");
const router = express.Router();

/* -------------------------------------------------------------------------- */
/*                            GET: Current log level                           */
/* -------------------------------------------------------------------------- */
// curl http://localhost:3001/api/logger
router.get("/", (req, res) => {
  try {
    res.json({
      success: true,
      currentLevel: logger.getLevel(),
      availableLevels: logger.getLevels(),
      description: {
        ERROR: "only errors",
        WARN: "warnings and errors",
        INFO: "general information (default)",
        SUCCESS: "general information + successes",
        DEBUG: "all information (for developers)",
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* -------------------------------------------------------------------------- */
/*                     GET: Change log level via URL param                     */
/* -------------------------------------------------------------------------- */
// curl http://localhost:3001/api/logger/setlog/debug
router.get("/setlog/:level", (req, res) => {
  try {
    const { level } = req.params;

    if (!level) {
      return res.status(400).json({
        success: false,
        error: "Missing level parameter",
        availableLevels: logger.getLevels(),
        example: "http://localhost:3001/api/logger/setlog/debug",
      });
    }

    const changed = logger.setLevel(level.toUpperCase());

    if (changed) {
      return res.json({
        success: true,
        message: `Log level changed to ${level.toUpperCase()}`,
        currentLevel: logger.getLevel(),
        availableLevels: logger.getLevels(),
      });
    }

    res.status(400).json({
      success: false,
      error: "Invalid log level",
      requestedLevel: level,
      availableLevels: logger.getLevels(),
      examples: [
        "http://localhost:3001/api/logger/setlog/debug",
        "http://localhost:3001/api/logger/setlog/info",
        "http://localhost:3001/api/logger/setlog/error",
        "http://localhost:3001/api/logger/setlog/warn",
        "http://localhost:3001/api/logger/setlog/success",
      ],
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* -------------------------------------------------------------------------- */
/*                                GET: Log stats                               */
/* -------------------------------------------------------------------------- */
// curl http://localhost:3001/api/logger/stats
router.get("/stats", (req, res) => {
  try {
    const fs = require("fs");
    const path = require("path");

    const logsDir = path.join(process.cwd(), "logs");

    // No logs folder
    if (!fs.existsSync(logsDir)) {
      return res.json({
        success: true,
        totalFiles: 0,
        totalSize: "0 KB",
        files: [],
      });
    }

    const files = fs.readdirSync(logsDir);
    let totalSize = 0;

    const stats = files.map((file) => {
      const filePath = path.join(logsDir, file);
      const stat = fs.statSync(filePath);

      totalSize += stat.size;

      return {
        name: file,
        size: `${(stat.size / 1024).toFixed(2)} KB`,
        modified: stat.mtime.toLocaleString("he-IL"),
      };
    });

    res.json({
      success: true,
      currentLevel: logger.getLevel(),
      totalFiles: files.length,
      totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
      files: stats,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* -------------------------------------------------------------------------- */
/*                           GET: Cleanup old logs                             */
/* -------------------------------------------------------------------------- */
// curl http://localhost:3001/api/logger/cleanup
// curl http://localhost:3001/api/logger/cleanup/30
router.get("/cleanup/:days?", (req, res) => {
  try {
    const days = parseInt(req.params.days) || 7;

    logger.cleanOldLogs(days);

    res.json({
      success: true,
      message: `Cleaned logs older than ${days} days`,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* -------------------------------------------------------------------------- */
/*                                   EXPORT                                    */
/* -------------------------------------------------------------------------- */
module.exports = router;
