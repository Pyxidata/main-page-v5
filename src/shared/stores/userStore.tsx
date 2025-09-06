import { create } from "zustand";

interface UserStore {
    isEditMode: boolean;
    setEditMode: (isEditMode: boolean) => void;
}

export const useUserStore = create<UserStore>((set) => ({
    isEditMode: false,
    setEditMode: (newValue) => set({ isEditMode: newValue }),
}));
