'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  LanguageCode,
  SUPPORTED_LANGUAGES,
  t as translate,
  getTextDir,
  detectLanguage,
} from './translations';

interface LanguageContextValue {
  lang: LanguageCode;
  setLang: (code: LanguageCode) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
  dir: 'ltr',
  supportedLanguages: SUPPORTED_LANGUAGES,
});

export function LanguageProvider({
  children,
  initialLang,
}: {
  children: React.ReactNode;
  initialLang?: LanguageCode;
}) {
  const [lang, setLangState] = useState<LanguageCode>(initialLang ?? 'en');

  // Hydrate from storage/browser on mount
  useEffect(() => {
    if (!initialLang) {
      setLangState(detectLanguage());
    }
  }, [initialLang]);

  // Apply RTL/LTR direction to document when language changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = getTextDir(lang);
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const setLang = useCallback((code: LanguageCode) => {
    setLangState(code);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('preferredLanguage', code);
    }
  }, []);

  const t = useCallback((key: string) => translate(key, lang), [lang]);
  const dir = getTextDir(lang);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir, supportedLanguages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

// ─── Language Selector Component ──────────────────────────────────────────────
export function LanguageSelector({ className = '' }: { className?: string }) {
  const { lang, setLang, supportedLanguages } = useLanguage();

  return (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value as LanguageCode)}
      className={`text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0F2557]/20 focus:border-[#0F2557] cursor-pointer ${className}`}
      aria-label="Select language"
    >
      {supportedLanguages.map((l) => (
        <option key={l.code} value={l.code}>
          {l.nativeLabel}
        </option>
      ))}
    </select>
  );
}

// ─── Inline Language Pills (for intake form) ──────────────────────────────────
export function LanguagePills({ className = '' }: { className?: string }) {
  const { lang, setLang, supportedLanguages } = useLanguage();

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {supportedLanguages.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLang(l.code as LanguageCode)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            lang === l.code
              ? 'bg-[#0F2557] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {l.nativeLabel}
        </button>
      ))}
    </div>
  );
}
