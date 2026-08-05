import { useUIStore } from '../store/ui.store';
import type { Theme } from '../store/ui.store';

interface UseThemeResult {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

/**
 * Accès au thème. La synchronisation avec <html data-theme> est faite par le
 * store lui-même (applyTheme) et par le script anti-FOUC de index.html, donc
 * ce hook n'a aucun effet de bord.
 */
export function useTheme(): UseThemeResult {
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);

  return { theme, isDark: theme === 'dark', setTheme, toggleTheme };
}
