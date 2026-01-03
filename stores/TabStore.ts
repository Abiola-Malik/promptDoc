import { create } from "zustand";

export const useTabsStore = create<{
  activeTab: string;
  setActiveTab: (tab: string) => void;
}>((set) => ({
  activeTab: "chat",
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
