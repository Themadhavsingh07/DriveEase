import { ENV } from '../config/env';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'secret',
  'authorization',
  'credit_card',
  'cardnumber',
  'cvv',
  'jwt',
  'refreshtoken',
  'accesstoken',
  'cookie',
  'razorpay_signature',
  'razorpaykeysecret',
  'razorpaywebhooksecret',
  'smtp_pass',
]);

/**
 * Recursively deep-sanitizes objects or arrays to prevent secrets leaking in logs.
 */
export function sanitizeData(data: any): any {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item));
  }

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lowerKey) || lowerKey.includes('secret') || lowerKey.includes('password')) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

class Logger {
  private formatLog(level: LogLevel, message: string, meta?: any) {
    const timestamp = new Date().toISOString();
    const sanitizedMeta = meta ? sanitizeData(meta) : undefined;

    if (ENV.NODE_ENV === 'production') {
      // Structured JSON logging in production
      const logObject = {
        timestamp,
        level,
        message,
        environment: ENV.NODE_ENV,
        ...(sanitizedMeta && { meta: sanitizedMeta }),
      };
      return JSON.stringify(logObject);
    } else {
      // Human-readable in development
      const prefix = {
        info: 'ℹ️ [INFO]',
        warn: '⚠️ [WARN]',
        error: '❌ [ERROR]',
        debug: '🔍 [DEBUG]',
      }[level];

      const metaStr = sanitizedMeta ? `\n${JSON.stringify(sanitizedMeta, null, 2)}` : '';
      return `${timestamp} ${prefix} ${message}${metaStr}`;
    }
  }

  info(message: string, meta?: any) {
    console.log(this.formatLog('info', message, meta));
  }

  warn(message: string, meta?: any) {
    console.warn(this.formatLog('warn', message, meta));
  }

  error(message: string, meta?: any) {
    console.error(this.formatLog('error', message, meta));
  }

  debug(message: string, meta?: any) {
    if (ENV.NODE_ENV !== 'production') {
      console.debug(this.formatLog('debug', message, meta));
    }
  }
}

export const logger = new Logger();
export default logger;
