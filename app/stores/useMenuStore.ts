import { create } from "zustand";

interface MenuStore {
	menuId: string | undefined;
	contentName: string | undefined;

	setMenuId: (menuId: string | undefined) => void;
	setContentName: (contentName: string | undefined) => void;
	clearMenu: () => void;
}

export const useMenuStore = create<MenuStore>((set) => ({
	menuId: undefined,
	contentName: undefined,

	setMenuId: (menuId) => set({ menuId }),

	setContentName: (contentName) => set({ contentName }),

	clearMenu: () => set({ menuId: undefined, contentName: undefined }),
}));
