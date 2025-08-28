import { create } from "zustand";

interface UiStore {
	// Sidebar state
	isSidebarOpen: boolean;

	// Loading state
	isLoading: boolean;
	loadingMessage: string;

	// Notifications
	notifications: Array<{
		id: string;
		type: "success" | "error" | "warning" | "info";
		message: string;
		duration?: number;
	}>;

	toggleSidebar: () => void;
	setLoading: (loading: boolean) => void;
	addNotification: (
		notification: Omit<UiStore["notifications"][0], "id">,
	) => void;
	removeNotification: (id: string) => void;
}

export const useUiStore = create<UiStore>((set, get) => ({
	isSidebarOpen: true,
	isLoading: false,
	loadingMessage: "",
	notifications: [],

	toggleSidebar: () =>
		set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

	setLoading: (loading, message = "") =>
		set({ isLoading: loading, loadingMessage: message }),

	addNotification: (notification) => {
		const id = Date.now().toString();
		const newNotification = { ...notification, id };

		set((state) => ({
			notifications: [...state.notifications, newNotification],
		}));

		if (notification.duration) {
			setTimeout(() => {
				get().removeNotification(id);
			}, notification.duration);
		}
	},

	removeNotification: (id) =>
		set((state) => ({
			notifications: state.notifications.filter((n) => n.id !== id),
		})),
}));
