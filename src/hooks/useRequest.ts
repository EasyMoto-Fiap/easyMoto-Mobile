import { useCallback, useState } from 'react';

type RunOptions = { loadingText?: string | null };

export default function useRequest() {
  const [loadingVisible, setLoadingVisible] = useState(false);
  const [loadingText, setLoadingText] = useState<string | null>(null);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hideError = useCallback(() => {
    setErrorVisible(false);
    setErrorMessage(null);
  }, []);

  const run = useCallback(async <T>(fn: () => Promise<T>, options?: RunOptions) => {
    setLoadingText(options?.loadingText || null);
    setLoadingVisible(true);
    try {
      const res = await fn();
      return res;
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Ocorreu um erro';
      setErrorMessage(msg);
      setErrorVisible(true);
      throw e;
    } finally {
      setLoadingVisible(false);
      setLoadingText(null);
    }
  }, []);

  return { run, loadingVisible, loadingText, errorVisible, errorMessage, hideError };
}
