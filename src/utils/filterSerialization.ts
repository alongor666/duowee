import type { FilterState } from '@/types';

// Use a single JSON-encoded query param for robustness and simplicity
const QUERY_KEY = 'filters';

export function encodeFiltersToQuery(filters: FilterState): string {
  try {
    const json = JSON.stringify(filters);
    return `${QUERY_KEY}=${encodeURIComponent(json)}`;
  } catch {
    return '';
  }
}

export function decodeFiltersFromQuery(search: string): FilterState | null {
  try {
    const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
    const value = params.get(QUERY_KEY);
    if (!value) return null;
    const parsed = JSON.parse(decodeURIComponent(value));
    return parsed as FilterState;
  } catch {
    return null;
  }
}

export const FILTERS_QUERY_KEY = QUERY_KEY;

