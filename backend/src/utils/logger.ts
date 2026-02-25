type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  metadata?: any;
  timestamp: string;
}

class Logger {
  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(level: LogLevel, message: string, metadata?: any): string {
    const timestamp = this.formatTimestamp();
    const metaStr = metadata ? ` ${JSON.stringify(metadata)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  info(message: string, metadata?: any): void {
    console.log(this.formatMessage('info', message, metadata));
  }

  warn(message: string, metadata?: any): void {
    console.warn(this.formatMessage('warn', message, metadata));
  }

  error(message: string, metadata?: any): void {
    console.error(this.formatMessage('error', message, metadata));
  }

  debug(message: string, metadata?: any): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatMessage('debug', message, metadata));
    }
  }
}

export const logger = new Logger();
