import { useState, useEffect, useCallback } from 'react';

interface UseApiOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useApi<T>(
  fetchFn: () => Promise<{ success: boolean; data?: T; error?: string }>,
  options: UseApiOptions<T> = {}
) {
  const { immediate = true, onSuccess, onError } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchFn();
      if (response.success && response.data) {
        setData(response.data);
        onSuccess?.(response.data);
      } else {
        setError(response.error || '请求失败');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '请求失败';
      setError(message);
      onError?.(err as Error);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, onSuccess, onError]);

  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return { data, loading, error, refetch };
}
