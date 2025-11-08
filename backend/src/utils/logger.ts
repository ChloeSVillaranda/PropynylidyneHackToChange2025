/* eslint-disable no-console */

export const logger = {
  info: (message: string, meta?: unknown) => {
    console.log(JSON.stringify({ level: "info", message, meta, timestamp: new Date().toISOString() }));
  },
  error: (message: string, meta?: unknown) => {
    console.error(
      JSON.stringify({ level: "error", message, meta, timestamp: new Date().toISOString() })
    );
  },
  debug: (message: string, meta?: unknown) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(
        JSON.stringify({ level: "debug", message, meta, timestamp: new Date().toISOString() })
      );
    }
  }
};

