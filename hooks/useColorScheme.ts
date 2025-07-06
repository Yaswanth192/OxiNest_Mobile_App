import { ThemeContext } from '@/theme/ThemeContext';
import { useContext } from 'react';

export function useColorScheme() {
  const { theme } = useContext(ThemeContext);
  return theme;
}
