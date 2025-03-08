const createDebug = (namespace) => {
  const debug = (...args) => {
    if (import.meta.env.DEBUG?.includes(namespace)) {
      console.log(`[${namespace}]`, ...args);
    }
  };

  debug.error = (...args) => {
    if (import.meta.env.DEBUG?.includes(namespace)) {
      console.error(`[${namespace}]`, ...args);
    }
  };

  debug.warn = (...args) => {
    if (import.meta.env.DEBUG?.includes(namespace)) {
      console.warn(`[${namespace}]`, ...args);
    }
  };

  return debug;
};

export const debug = {
  player: createDebug("game:player"),
  sprite: createDebug("game:sprite"),
  bot: createDebug("game:bot"),
  game: createDebug("game:game"),
};
