import { create } from "zustand";
import i18n from "~/i18n";
import { languages } from "~/constants/languages";

type Language = keyof typeof languages;

interface SavedSettings {
	language: Language;
	// theme?: "light" | "dark" | "system";
}

interface PendingChanges {
	language?: Language;
	// theme?: "light" | "dark" | "system";
}

interface SettingsStore {
	activeSection: string;
	setActiveSection: (section: string) => void;

	savedSettings: SavedSettings;
	pendingChanges: PendingChanges;
	hasUnsavedChanges: () => boolean;
	cancelChanges: () => void;
	saveChanges: () => Promise<void>;
}

interface LanguageSectionStore {
	language: Language;
	selectedLanguage: Language;
	setLanguage: (language: Language) => void;
	setSelectedLanguage: (selectedLanguage: Language) => void;
}

export const useSettingsStore = create<SettingsStore & LanguageSectionStore>(
	(set, get) => ({
		activeSection: "account_details",
		setActiveSection: (activeSection) => {
			set({ activeSection });
		},

		// Initialize saved settings values
		savedSettings: {
			language: (i18n.language as Language) || "en",
		},

		pendingChanges: {},

		hasUnsavedChanges: () => {
			const state = get();
			return Object.keys(state.pendingChanges).length > 0;
		},

		cancelChanges: () => {
			set({ pendingChanges: {} });
		},

		saveChanges: async () => {
			const state = get();
			const { pendingChanges, savedSettings } = state;

			// Apply language change if pending
			if (pendingChanges.language) {
				console.log(pendingChanges.language);
				await i18n.changeLanguage(pendingChanges.language as string);
			}

			// Merge pending changes into saved settings
			const newSavedSettings = {
				...savedSettings,
				...pendingChanges,
			};

			// Clear pending changes and update saved settings
			set({
				savedSettings: newSavedSettings,
				pendingChanges: {},
			});

			// TODO: Save to backend/localStorage if needed
			console.log("Settings saved:", newSavedSettings);
		},

		// ═══════════════════════════════════════════════════════════════════════════════════
		//                             LANGUAGE SECTION
		// ═══════════════════════════════════════════════════════════════════════════════════

		get language() {
			const state = get();
			return state.pendingChanges.language ?? state.savedSettings.language;
		},

		setLanguage: (language: Language) => {
			set((state) => ({
				pendingChanges: {
					...state.pendingChanges,
					language,
				},
			}));
		},

		get selectedLanguage() {
			const state = get();
			return state.language;
		},

		setSelectedLanguage: (selectedLanguage: Language) => {
			set({ selectedLanguage });
		},
	}),
);
