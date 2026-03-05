import { type ErrorRequestHandler } from 'express';
import { appendFile, mkdir } from 'fs/promises';
import { join } from 'path';

const errorHandler: ErrorRequestHandler = async (err, req, res, next) => {
  const logDir = join(process.cwd(), 'log');
  await mkdir(logDir, { recursive: true });

  const dateString = new Date().toISOString().split('T')[0];

  const logFilePath = join(logDir, `${dateString}-error.log`);

  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${req.method} ${req.url} - Error: ${err.message} - Stack: ${err.stack}\n`;
  console.log(logEntry);

  await appendFile(logFilePath, logEntry, 'utf-8');

  console.log(`Error: ${err.message}`);
  console.log(err.cause);
  return res.status(err.cause || 500).json({ message: err.message });
};

export default errorHandler;
