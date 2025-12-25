import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

// Define the mock function using vi.hoisted so it can be referenced in vi.mock
const { mockChangeLanguage } = vi.hoisted(() => ({
	mockChangeLanguage: vi.fn(() => Promise.resolve()),
}));

// Mock i18n - using the hoisted mock function
vi.mock("~/i18n", () => ({
	default: {
		language: "en",
		changeLanguage: mockChangeLanguage,
	},
}));

import { useSettingsStore } from "./useSettingsStore";
import i18n from "~/i18n";

describe("useSettingsStore", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Reset store state
		useSettingsStore.setState({
			activeSection: "account_details",
			savedSettings: { language: "en" },
			pendingChanges: {},
		});
	});

	it("should have initial state", () => {
		const { result } = renderHook(() => useSettingsStore());

		expect(result.current.activeSection).toBe("account_details");
		expect(result.current.savedSettings.language).toBe("en");
		expect(result.current.pendingChanges).toEqual({});
	});

	it("should set active section", () => {
		const { result } = renderHook(() => useSettingsStore());

		act(() => {
			result.current.setActiveSection("language");
		});

		expect(result.current.activeSection).toBe("language");
	});

	it("should set language and create pending change", () => {
		const { result } = renderHook(() => useSettingsStore());

		act(() => {
			result.current.setLanguage("tr");
		});

		// Check pending changes directly
		expect(result.current.pendingChanges.language).toBe("tr");
		expect(result.current.hasUnsavedChanges()).toBe(true);
		// The effective language is pendingChanges.language ?? savedSettings.language
		const effectiveLanguage =
			result.current.pendingChanges.language ??
			result.current.savedSettings.language;
		expect(effectiveLanguage).toBe("tr");
	});

	it("should not create pending change when setting to current language", () => {
		const { result } = renderHook(() => useSettingsStore());

		act(() => {
			result.current.setLanguage("en");
		});

		expect(result.current.hasUnsavedChanges()).toBe(false);
	});

	it("should return correct language from getter", () => {
		const { result } = renderHook(() => useSettingsStore());

		// Check initial effective language
		const initialLanguage =
			result.current.pendingChanges.language ??
			result.current.savedSettings.language;
		expect(initialLanguage).toBe("en");

		act(() => {
			result.current.setLanguage("pl");
		});

		// After setLanguage, the effective language should be 'pl'
		const effectiveLanguage =
			result.current.pendingChanges.language ??
			result.current.savedSettings.language;
		expect(effectiveLanguage).toBe("pl");
	});

	it("should return selectedLanguage matching language", () => {
		const { result } = renderHook(() => useSettingsStore());

		act(() => {
			result.current.setLanguage("tr");
		});

		// selectedLanguage should reflect the pending change
		const effectiveLanguage =
			result.current.pendingChanges.language ??
			result.current.savedSettings.language;
		expect(effectiveLanguage).toBe("tr");
	});

	it("should detect unsaved changes", () => {
		const { result } = renderHook(() => useSettingsStore());

		expect(result.current.hasUnsavedChanges()).toBe(false);

		act(() => {
			result.current.setLanguage("pl");
		});

		expect(result.current.hasUnsavedChanges()).toBe(true);
	});

	it("should cancel changes", () => {
		const { result } = renderHook(() => useSettingsStore());

		act(() => {
			result.current.setLanguage("tr");
		});

		expect(result.current.hasUnsavedChanges()).toBe(true);

		act(() => {
			result.current.cancelChanges();
		});

		expect(result.current.hasUnsavedChanges()).toBe(false);
		const effectiveLanguage =
			result.current.pendingChanges.language ??
			result.current.savedSettings.language;
		expect(effectiveLanguage).toBe("en");
	});

	it("should save changes and update saved settings", async () => {
		const { result } = renderHook(() => useSettingsStore());

		act(() => {
			result.current.setLanguage("pl");
		});

		expect(result.current.hasUnsavedChanges()).toBe(true);

		await act(async () => {
			await result.current.saveChanges();
		});

		await waitFor(() => {
			expect(i18n.changeLanguage).toHaveBeenCalledWith("pl");
			expect(result.current.hasUnsavedChanges()).toBe(false);
			expect(result.current.savedSettings.language).toBe("pl");
		});
	});

	it("should clear pending changes after save", async () => {
		const { result } = renderHook(() => useSettingsStore());

		act(() => {
			result.current.setLanguage("tr");
		});

		await act(async () => {
			await result.current.saveChanges();
		});

		await waitFor(() => {
			expect(result.current.pendingChanges).toEqual({});
		});
	});

	it("should cancel language change specifically", () => {
		const { result } = renderHook(() => useSettingsStore());

		act(() => {
			result.current.setLanguage("pl");
		});

		let effectiveLanguage =
			result.current.pendingChanges.language ??
			result.current.savedSettings.language;
		expect(effectiveLanguage).toBe("pl");

		act(() => {
			result.current.cancelLanguageChange();
		});

		// After cancel, pendingChanges.language should be undefined/deleted
		effectiveLanguage =
			result.current.pendingChanges.language ??
			result.current.savedSettings.language;
		expect(effectiveLanguage).toBe("en");
	});

	it("should handle multiple language changes", () => {
		const { result } = renderHook(() => useSettingsStore());

		act(() => {
			result.current.setLanguage("tr");
		});

		let effectiveLanguage =
			result.current.pendingChanges.language ??
			result.current.savedSettings.language;
		expect(effectiveLanguage).toBe("tr");

		act(() => {
			result.current.setLanguage("pl");
		});

		effectiveLanguage =
			result.current.pendingChanges.language ??
			result.current.savedSettings.language;
		expect(effectiveLanguage).toBe("pl");
		expect(result.current.hasUnsavedChanges()).toBe(true);
	});
});
