import { create } from "zustand";
import { persist } from "zustand/middleware";

// Translations dipecah ke file terpisah agar tidak di-bundle sekaligus 91KB
// Setiap locale ~45KB — di-import statis tapi terpisah per chunk oleh bundler
import enTranslations from "./translations/en";
import idTranslations from "./translations/id";
import { useCmsStore } from "./cms";

export type Locale = "en" | "id";

interface LangState {
  locale: Locale;
  guestLocale: Locale;
  userLocales: Record<string | number, Locale>;
  setLocale: (locale: Locale, userId?: string | number) => void;
  syncUserLocale: (userId: string | number) => void;
  syncGuestLocale: () => void;
}

export const useLangStore = create<LangState>()(
  persist(
    (set, get) => ({
      locale: "en",
      guestLocale: "en",
      userLocales: {},

      setLocale: (locale: Locale, userId?: string | number) => {
        let currentUserId = userId;
        if (!currentUserId && typeof window !== "undefined") {
          try {
            const authData = localStorage.getItem("becdex-auth");
            if (authData) {
              const parsed = JSON.parse(authData);
              currentUserId = parsed?.state?.user?.id;
            }
          } catch {
            // ignore
          }
        }

        if (currentUserId) {
          // Jika user sedang login, simpan preferensi spesifik untuk akun ini
          set((state) => ({
            locale,
            userLocales: {
              ...(state.userLocales || {}),
              [currentUserId!]: locale,
            },
          }));
        } else {
          // Jika pengunjung umum (guest), simpan ke preferensi guest
          set({
            locale,
            guestLocale: locale,
          });
        }
      },

      syncUserLocale: (userId: string | number) => {
        const state = get();
        const userPref = state.userLocales?.[userId];
        if (userPref) {
          set({ locale: userPref });
        } else {
          // Jika belum ada preferensi tersimpan untuk akun ini, simpan locale saat ini sebagai default akun
          set({
            userLocales: {
              ...(state.userLocales || {}),
              [userId]: state.locale,
            },
          });
        }
      },

      syncGuestLocale: () => {
        const state = get();
        set({ locale: state.guestLocale || "en" });
      },
    }),
    {
      name: "becdex-lang",
      onRehydrateStorage: () => (state) => {
        if (state && typeof window !== "undefined") {
          try {
            const authData = localStorage.getItem("becdex-auth");
            if (authData) {
              const parsed = JSON.parse(authData);
              const userId = parsed?.state?.user?.id;
              if (userId && state.userLocales?.[userId]) {
                state.locale = state.userLocales[userId];
              }
            }
          } catch {
            // ignore
          }
        }
      },
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

