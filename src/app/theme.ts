// ThemeProvider：主题唯一控件（module_contracts.md §1.5；DESIGN.md §8）
import { useCallback, useEffect, useState } from 'react';
import type { ThemeMode } from '../data/types';

const STORAGE_KEY = 'atlas.theme';
const mql = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null;

function effective(mode: ThemeMode): 'day' | 'night' {
  return mode === 'night' || (mode === 'system' && (mql?.matches ?? false)) ? 'night' : 'day';
}

function loadMode(): ThemeMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'day' || raw === 'night' || raw === 'system') return raw;
  } catch {
    /* ignore */
  }
  return 'system';
}

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(loadMode);

  useEffect(() => {
    document.documentElement.dataset.theme = effective(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* ignore quota */
    }
  }, [mode]);

  useEffect(() => {
    if (!mql) return;
    const onChange = () => {
      document.documentElement.dataset.theme = effective(mode);
    };
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [mode]);

  const setTheme = useCallback((next: ThemeMode) => setMode(next), []);
  return { mode, setTheme };
}
