import { useQuery } from '@tanstack/react-query';
import { useDebounce } from './useDebounce';

export interface UseFullTextSearchOptions {
  query: string;
  category?: string; // сохраним на будущее, но сейчас визуально категория убрана
  enabled?: boolean;
  debounceMs?: number; // позволим управлять задержкой (старый UX — быстрее)
}

export function useFullTextSearch({ query, category, enabled = true, debounceMs = 300 }: UseFullTextSearchOptions) {
  // Более быстрый отклик визуально напоминает старый поиск с подсказками
  const debounced = useDebounce(query, debounceMs);
  const canRun = enabled && debounced.trim().length >= 2;
  return useQuery({
    queryKey: ['full-search', debounced, category],
    enabled: canRun,
    queryFn: async () => {
      const p = new URLSearchParams({ q: debounced });
      if (category) p.set('category', category);
      const resp = await fetch(`/api/search/full?${p.toString()}`);
      if (!resp.ok) throw new Error('Search request failed');
      return resp.json() as Promise<{ query: string; timeMs: number; count: number; results: any[] }>;
    },
    staleTime: 10_000,
  });
}
