import { create } from "zustand";

export const useToastStore = create((set) => ({
  toast: null, // { id, message, type: 'success' | 'info' | 'heart' }

  showToast: (message, type = "success") => {
    const id = Date.now();
    set({ toast: { id, message, type } });

    setTimeout(() => {
      set((state) => (state.toast?.id === id ? { toast: null } : state));
    }, 2600);
  },

  hideToast: () => set({ toast: null }),
}));