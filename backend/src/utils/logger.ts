/* eslint-disable no-console */

const serialize = (level: string, message: string, meta?: unknown) => {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(meta === undefined ? {} : { meta })
  };

  try {
    return JSON.stringify(payload);
  } catch (error) {
    const fallback = {
      ...payload,
      meta:
        meta instanceof Error
          ? { name: meta.name, message: meta.message, stack: meta.stack }
          : { note: "Unserializable meta", originalMetaType: typeof meta }
    };
    return JSON.stringify(fallback);
  }
};

export const logger = {
  info: (message: string, meta?: unknown) => {
    console.log(serialize("info", message, meta));
  },
  error: (message: string, meta?: unknown) => {
    console.error(serialize("error", message, meta));
  },
  debug: (message: string, meta?: unknown) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(serialize("debug", message, meta));
    }
  }
};

