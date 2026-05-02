import React, { createContext, useContext, useState, useEffect } from 'react';

type DiffView = 'unified' | 'split';

interface SettingsContextType {
  fontSize: number;
  setFontSize: (size: number) => void;
  diffView: DiffView;
  setDiffView: (view: DiffView) => void;
}

const SettingsContext = createContext<SettingsContextType>({
  fontSize: 14,
  setFontSize: () => {},
  diffView: 'unified',
  setDiffView: () => {},
});

export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSizeState] = useState<number>(() => {
    const saved = localStorage.getItem('codereader-fontSize');
    if (saved) {
      const n = parseInt(saved, 10);
      if (n >= 10 && n <= 24) return n;
    }
    return 14;
  });

  const [diffView, setDiffViewState] = useState<DiffView>(() => {
    const saved = localStorage.getItem('codereader-diffView');
    if (saved === 'unified' || saved === 'split') return saved;
    return 'unified';
  });

  useEffect(() => {
    localStorage.setItem('codereader-fontSize', String(fontSize));
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('codereader-diffView', diffView);
  }, [diffView]);

  const setFontSize = (size: number) => {
    if (size >= 10 && size <= 24) setFontSizeState(size);
  };

  const setDiffView = (view: DiffView) => {
    setDiffViewState(view);
  };

  return (
    <SettingsContext.Provider value={{ fontSize, setFontSize, diffView, setDiffView }}>
      {children}
    </SettingsContext.Provider>
  );
}
