import { create } from "zustand";
import { persist } from "zustand/middleware";

// Translations dipecah ke file terpisah agar tidak di-bundle sekaligus 91KB
// Setiap locale ~45KB — di-import statis tapi terpisah per chunk oleh bundler
import enTranslations from "./translations/en";
import idTranslations from "./translations/id";
import { useCmsStore } from "./cms";

type Locale = "en" | "id";

interface LangState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      locale: "en",
      setLocale: (locale: Locale) => set({ locale }),
    }),
    {
      name: "becdex-lang",
    }
  )
);

export const TRANSLATIONS = {
  en: enTranslations,
  id: idTranslations,
};

export function useTranslation() {
  const { locale } = useLangStore();
  const cmsContents = useCmsStore((state) => state.contents);

  // Fallback to static TRANSLATIONS
  const staticT = TRANSLATIONS[locale];
  // Dynamic contents for the current locale
  const dynamicT = cmsContents[locale] || {};

  // We merge them: dynamic takes precedence
  const t = { ...staticT, ...dynamicT };

  return { t, locale };
}
