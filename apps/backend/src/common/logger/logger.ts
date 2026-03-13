import { LoggerService } from '@nestjs/common';
import pino from 'pino';

export class Logger implements LoggerService {
  private readonly pino: pino.Logger;

  constructor() {
    this.pino = pino({
      level: process.env.LOG_LEVEL ?? 'info',
      transport:
        process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    });
  }

  log(message: string, ...optionalParams: unknown[]) {
    this.pino.info(optionalParams.length ? { msg: message, ...optionalParams } : message);
  }

  error(message: string, ...optionalParams: unknown[]) {
    this.pino.error(optionalParams.length ? { msg: message, ...optionalParams } : message);
  }

  warn(message: string, ...optionalParams: unknown[]) {
    this.pino.warn(optionalParams.length ? { msg: message, ...optionalParams } : message);
  }

  debug(message: string, ...optionalParams: unknown[]) {
    this.pino.debug(optionalParams.length ? { msg: message, ...optionalParams } : message);
  }

  verbose(message: string, ...optionalParams: unknown[]) {
    this.pino.trace(optionalParams.length ? { msg: message, ...optionalParams } : message);
  }
}
