import { create } from "zustand";
import type { UserDto } from "~/types/user";
import {
	hasAdminRole,
	hasDeveloperRole,
	canRegisterThemes,
	canUnregisterThemes,
} from "~/types/user";

interface UserStore {
	user: UserDto | null;
	setUser: (user: UserDto | null) => void;
	updateRoles: (roles: string[]) => void;
	clearUser: () => void;

	hasDeveloperRole: () => boolean;
	hasAdminRole: () => boolean;
	canRegisterThemes: () => boolean;
	canUnregisterThemes: (themeOwnerUsername?: string) => boolean;
}

export const useUserStore = create<UserStore>((set, get) => ({
	user: null,

	setUser: (user) => set({ user }),

	updateRoles: (roles) =>
		set((state) => (state.user ? { user: { ...state.user, roles } } : state)),

	clearUser: () => set({ user: null }),

	hasDeveloperRole: () => {
		const { user } = get();
		return hasDeveloperRole(user);
	},

	hasAdminRole: () => {
		const { user } = get();
		return hasAdminRole(user);
	},

	canRegisterThemes: () => {
		const { user } = get();
		return canRegisterThemes(user);
	},

	canUnregisterThemes: (themeOwnerUsername?: string) => {
		const { user } = get();
		return canUnregisterThemes(user, themeOwnerUsername);
	},
}));
