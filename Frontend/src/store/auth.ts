import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";
import { useLangStore } from "./lang";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setAuth: (user: User) => {
        set({ user, isAuthenticated: true });
        // Sinkronkan bahasa sesuai preferensi akun yang login
        useLangStore.getState().syncUserLocale(user.id);
      },

      setUser: (user: User) => {
        set({ user });
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
        // Kembalikan bahasa ke preferensi guest browser
        useLangStore.getState().syncGuestLocale();
      },
    }),
    {
      name: "becdex-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
