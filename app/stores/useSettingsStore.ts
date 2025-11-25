import { create } from "zustand";
import i18n from "~/i18n";
import { languages } from "~/constants/languages";

type Language = keyof typeof languages;
export type Theme = "light" | "dark" | "system";

interface SavedSettings {
	language: Language;
}

interface PendingChanges {
	language?: Language;
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
	cancelLanguageChange: () => void;
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
			set((state) => ({ pendingChanges: {} }));
			get().cancelLanguageChange();
		},

		saveChanges: async () => {
			const state = get();
			const { pendingChanges, savedSettings } = state;

			// Apply language change if pending
			if (pendingChanges.language) {
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

			// TODO: Save to backend if needed
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
			if (language === get().savedSettings.language) {
				get().cancelLanguageChange();
				return;
			}
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

		cancelLanguageChange: () => {
			set({ selectedLanguage: get().savedSettings.language });
			delete get().pendingChanges.language;
		},
	}),
);
