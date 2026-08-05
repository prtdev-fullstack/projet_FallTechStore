import { useEffect, useState } from 'react';

/** Points de rupture — alignés sur ceux de Tailwind. */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** Vrai en dessous de `lg` — le seuil où la navigation passe en menu mobile. */
export function useIsMobile(): boolean {
  return useMediaQuery(`(max-width: ${BREAKPOINTS.lg - 1}px)`);
}

/**
 * Vrai sur un appareil sans survol réel (tactile).
 * On s'en sert pour désactiver les effets qui n'ont aucun sens au doigt :
 * magnétisme des boutons, inclinaison des cartes, zoom à la loupe.
 */
export function useIsTouch(): boolean {
  return useMediaQuery('(hover: none), (pointer: coarse)');
}
