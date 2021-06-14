const LEVELS = {
  DEBUG: 1,
  INFO: 2,
  WARN: 3,
  ERROR: 4,
};

const getLevel = (level?: Level) => {
  return LEVELS[level || 'INFO'];
};

type Level = keyof typeof LEVELS;

export interface LoggerEvent {
  level?: Level;
  action: string;
  category?: string;
  error?: Error;
  data?: Record<string, any>;
}

export interface LoggerSubscriber {
  key: string;
  level?: Level;
  onEvent: (event: LoggerEvent) => void;
}

class Logger {
  private loggers: LoggerSubscriber[] = [];

  subscribe(newLogger: LoggerSubscriber) {
    this.loggers.push(newLogger);
    return () => this.loggers.filter((logger) => logger !== newLogger);
  }

  unsubscribe(key: string) {
    this.loggers.filter((logger) => logger.key !== key);
  }

  log(event: LoggerEvent) {
    this.loggers.forEach((logger) => {
      if (getLevel(event.level) >= getLevel(logger.level)) {
        logger.onEvent(event);
      }
    });
  }
}

export const logger = new Logger();
