type AsyncTask<T> = () => Promise<T>;

export const createSerializedTaskRunner = () => {
  let queue: Promise<void> = Promise.resolve();
  const inFlight = new Set<string>();

  return {
    run: async <T>(key: string | null, task: AsyncTask<T>): Promise<T | undefined> => {
      const queuedTask = queue.then(async () => {
        if (key && inFlight.has(key)) return undefined;

        if (key) inFlight.add(key);

        try {
          return await task();
        } finally {
          if (key) inFlight.delete(key);
        }
      });

      queue = queuedTask.then(
        () => undefined,
        () => undefined,
      );

      return queuedTask;
    },
  };
};
