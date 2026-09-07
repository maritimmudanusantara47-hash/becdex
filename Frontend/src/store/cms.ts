import { create } from "zustand";
import api from "@/lib/api";

type CmsContent = Record<string, string | string[] | null>;

interface CmsState {
  contents: {
    en: CmsContent;
    id: CmsContent;
  };
  isLoading: boolean;
  isFetched: boolean;
  fetchContents: () => Promise<void>;
}

export const useCmsStore = create<CmsState>((set, get) => ({
  contents: { en: {}, id: {} },
  isLoading: false,
  isFetched: false,

  fetchContents: async () => {
    if (get().isFetched || get().isLoading) return;
    
    set({ isLoading: true });
    try {
      const response = await api.get('/public/cms');
      set({ 
        contents: response.data, 
        isFetched: true 
      });
    } catch (error) {
      console.error("Failed to fetch CMS content:", error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
