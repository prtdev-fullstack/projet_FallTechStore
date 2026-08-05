import { useEffect, useState } from 'react';

/**
 * Valeur retardée. Utilisée par la recherche instantanée : on ne refiltre pas
 * le catalogue à chaque frappe, mais 180 ms après la dernière.
 */
export function useDebounce<T>(value: T, delay = 180): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
