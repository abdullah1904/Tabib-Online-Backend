import { createLogger, format, transports, addColors } from "winston";
import fs from "fs";
import path from "path";

const logsDir = "./logs";
fs.mkdirSync(logsDir, { recursive: true });

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  verbose: "cyan",
  debug: "white",
  silly: "gray",
};

addColors(colors);

const logFormat = format.printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6,
  },
  format: format.combine(
    format.label({ label: "Tabib-Online" }),
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat
  ),
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), logFormat),
    }),

    new transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      maxsize: 5242880,
      maxFiles: 5,
    }),

    new transports.File({
      filename: path.join(logsDir, "combined.log"),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

export { logger, morganStream };