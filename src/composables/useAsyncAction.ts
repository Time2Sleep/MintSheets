import { ref } from 'vue';

type AsyncActionOptions = {
  throwError?: boolean;
  errorMessage?: string;
};

export const useAsyncAction = <T = void>() => {
  const isLoading = ref<boolean>(false);
  const isError = ref<boolean>(false);
  const isSuccess = ref<boolean>(false);

  const execute = async (callback: () => Promise<T>, options: AsyncActionOptions = {}): Promise<T | undefined> => {
    if (isLoading.value) return;

    const { throwError = false, errorMessage = 'Async action failed' } = options;

    isLoading.value = true;
    isError.value = false;
    isSuccess.value = false;

    try {
      const result = await callback();

      isSuccess.value = true;

      return result;
    } catch (error) {
      console.warn(errorMessage, error);

      isError.value = true;

      if (throwError) throw error;

      return undefined;
    } finally {
      isLoading.value = false;
    }
  };

  const clearState = () => {
    isLoading.value = false;
    isError.value = false;
    isSuccess.value = false;
  };

  return {
    isError,
    isLoading,
    isSuccess,
    execute,
    clearState,
  };
};
