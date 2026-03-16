import { create } from 'zustand';

type ErrorState = {
  message: string | null;
  show: (message: string) => void;
  dismiss: () => void;
};

/** Minimal store for displaying error toasts in the webview. */
export const useErrorStore = create<ErrorState>((set) => ({
  message: null,
  show: (message) => set({ message }),
  dismiss: () => set({ message: null }),
}));
